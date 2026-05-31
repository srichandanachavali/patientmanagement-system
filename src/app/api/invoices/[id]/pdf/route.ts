// ── F085 · src/app/api/invoices/[id]/pdf/route.ts
// Purpose: GET invoice data shaped for client-side @react-pdf/renderer (InvoicePDF F174)
// In: veda_session (F011), Prisma Invoice (F002) | Out: PdfData JSON | See: F010, F011, F083, F174, F172
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft', SENT: 'Sent', PAID: 'Paid', PARTIALLY_PAID: 'Partially Paid', CANCELLED: 'Cancelled',
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const inv = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      patient:  { select: { name: true, phone: true } },
      lines:    { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { paidAt:    'asc' } },
    },
  })

  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const invoiceNumber = `INV-${inv.issuedAt.toISOString().slice(0, 10).replace(/-/g, '')}-${inv.id.slice(0, 4).toUpperCase()}`

  return NextResponse.json({
    invoiceNumber,
    invoiceDate: fmtDate(inv.issuedAt),
    patientName: inv.patient?.name  ?? '—',
    patientPhone:inv.patient?.phone ?? '—',
    status:      STATUS_LABEL[inv.status] ?? inv.status,
    lines: inv.lines.map((l) => ({
      description: l.description,
      amount:      l.amount,
      taxRate:     l.taxRate,
    })),
    payments: inv.payments.map((p) => ({
      amount:  p.amount,
      mode:    p.mode,
      paidAt:  fmtDate(p.paidAt),
    })),
  })
}
