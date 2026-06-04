// ── F082 · src/app/api/invoices/route.ts
// Purpose: GET invoice list with outstanding balance; POST create invoice + lines in one transaction
// In: veda_session (F011), Prisma Invoice (F002) | Out: serialized Invoice[] / 201 | See: F010, F011, F083, F170, F171
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

function outstanding(
  lines:    { amount: number; taxRate: number }[],
  payments: { amount: number }[],
): number {
  const total = lines.reduce((s, l) => s + l.amount * (1 + l.taxRate / 100), 0)
  const paid  = payments.reduce((s, p) => s + p.amount, 0)
  return Math.max(0, total - paid)
}

export async function GET(_req: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const invoices = await prisma.invoice.findMany({
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      lines:   { select: { amount: true, taxRate: true } },
      payments:{ select: { amount: true } },
    },
    orderBy: { issuedAt: 'desc' },
  })

  return NextResponse.json(invoices.map((inv) => ({
    id:          inv.id,
    issued_at:   inv.issuedAt.toISOString(),
    status:      inv.status,
    patients:    inv.patient,
    // DRAFT invoices are not yet issued — outstanding is 0 until finalized
    outstanding: inv.status === 'DRAFT' ? 0 : outstanding(inv.lines, inv.payments),
  })))
}

export async function POST(request: Request) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { patient_id, lines } = body as {
    patient_id: string
    lines: { description: string; amount: number; tax_rate: number }[]
  }

  if (!patient_id || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: 'patient_id and at least one line item are required' }, { status: 400 })
  }

  const invoice = await prisma.invoice.create({
    data: {
      patientId:   patient_id,
      createdById: session.userId,
      status:      'DRAFT',
      lines: {
        create: lines.map((l) => ({
          description: l.description,
          amount:      Number(l.amount),
          taxRate:     Number(l.tax_rate ?? 18),
        })),
      },
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      lines:   true,
      payments:true,
    },
  })

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'CREATE', entity: 'Invoice', entityId: invoice.id },
  }).catch(() => {})

  return NextResponse.json({ id: invoice.id, status: invoice.status }, { status: 201 })
}
