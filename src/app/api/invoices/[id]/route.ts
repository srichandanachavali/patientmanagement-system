// ── F083 · src/app/api/invoices/[id]/route.ts
// Purpose: GET invoice detail with all lines and payments
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
