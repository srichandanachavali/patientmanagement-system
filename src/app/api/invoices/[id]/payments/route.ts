// ── F084 · src/app/api/invoices/[id]/payments/route.ts
// Purpose: POST record a payment; auto-update invoice status to PARTIALLY_PAID or PAID
// In: veda_session (F011), Prisma Invoice + Payment (F002) | Out: { invoice_status } | See: F010, F011, F083, F172
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { amount, mode } = body as { amount: number; mode: string }
  if (!amount || amount <= 0) return NextResponse.json({ error: 'amount must be > 0' }, { status: 400 })
  if (!mode) return NextResponse.json({ error: 'mode is required' }, { status: 400 })

  // Load invoice with lines + existing payments to compute new balance
  const inv = await prisma.invoice.findUnique({
    where:   { id: params.id },
    include: { lines: true, payments: true },
  })
  if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (inv.status === 'CANCELLED') return NextResponse.json({ error: 'Invoice is cancelled' }, { status: 409 })

  const total       = inv.lines.reduce((s, l) => s + l.amount * (1 + l.taxRate / 100), 0)
  const alreadyPaid = inv.payments.reduce((s, p) => s + p.amount, 0)
  const newPaid     = alreadyPaid + Number(amount)

  const invoice_status = newPaid >= total ? 'PAID' : 'PARTIALLY_PAID'

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId:    params.id,
        amount:       Number(amount),
        mode,
        recordedById: session.userId,
      },
    }),
    prisma.invoice.update({
      where: { id: params.id },
      data:  { status: invoice_status },
    }),
  ])

  return NextResponse.json({ invoice_status })
}
