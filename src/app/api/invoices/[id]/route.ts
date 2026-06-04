// ── F083 · src/app/api/invoices/[id]/route.ts
// Purpose: GET invoice detail; PATCH finalize (DRAFT → SENT, sets issuedAt to now)
// In: veda_session (F011), Prisma Invoice (F002) | Out: serialized InvoiceDetail | See: F010, F011, F082, F172
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const inv = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      patient:  { select: { id: true, name: true, phone: true } },
      lines:    { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { paidAt:    'asc' } },
    },
  })

  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    id:        inv.id,
    issued_at: inv.issuedAt.toISOString(),
    status:    inv.status,
    patients:  inv.patient,
    invoice_lines: inv.lines.map((l) => ({
      id:          l.id,
      description: l.description,
      amount:      l.amount,
      tax_rate:    l.taxRate,
    })),
    payments: inv.payments.map((p) => ({
      id:      p.id,
      amount:  p.amount,
      mode:    p.mode,
      paid_at: p.paidAt.toISOString(),
    })),
  })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const inv = await prisma.invoice.findUnique({ where: { id: params.id }, select: { id: true, status: true } })
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.action === 'finalize') {
    if (inv.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Only DRAFT invoices can be finalized' }, { status: 409 })
    }
    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data:  { status: 'SENT', issuedAt: new Date() },
      select: { id: true, status: true, issuedAt: true },
    })
    await prisma.auditLog.create({
      data: { actorId: session.userId, action: 'UPDATE', entity: 'Invoice', entityId: params.id,
              metadata: JSON.stringify({ action: 'finalize' }) },
    }).catch(() => {})
    return NextResponse.json({ id: updated.id, status: updated.status, issued_at: updated.issuedAt.toISOString() })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
