'use client'
// ── F172 · src/app/(app)/billing/[invoiceId]/page.tsx
// Purpose: Invoice detail — DRAFT banner+Finalize, line items, GST, payment recording, UPI QR, PDF download, WhatsApp receipt
// In: GET/PATCH /api/invoices/:id, UpiQrCode (F176), PdfDownloadButton (F175), formatCurrency (F012) | Out: InvoicePage | See: F170, F174, F175, F176

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ChevronLeft, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { UpiQrCode, buildUpiQrDataUrl } from '@/components/billing/UpiQrCode'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { CLINIC_NAME } from '@/constants/clinic'
import type { InvoiceStatus, PaymentMode } from '@/types'

const PdfDownloadButton = dynamic(
  () => import('@/components/billing/PdfDownloadButton').then((m) => m.PdfDownloadButton),
  { ssr: false },
)

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  'DRAFT':          'bg-yellow-100 text-yellow-800 border border-yellow-300',
  'SENT':           'bg-info/10 text-info',
  'PAID':           'bg-success/10 text-success',
  'PARTIALLY_PAID': 'bg-warning/10 text-warning',
  'CANCELLED':      'bg-danger-bg text-danger',
}

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  'DRAFT':          'Draft',
  'SENT':           'Issued',
  'PAID':           'Paid',
  'PARTIALLY_PAID': 'Partially Paid',
  'CANCELLED':      'Cancelled',
}

const PAYMENT_MODES: PaymentMode[] = ['CASH', 'UPI', 'CARD']

interface InvoiceDetail {
  id: string
  issued_at: string
  status: InvoiceStatus
  patients: { id: string; name: string; phone: string } | null
  invoice_lines: { id: string; description: string; amount: number; tax_rate: number }[]
  payments: { id: string; amount: number; mode: PaymentMode; paid_at: string }[]
}

interface PdfData {
  invoiceNumber: string
  invoiceDate:   string
  patientName:   string
  patientPhone:  string
  lines:    Array<{ description: string; amount: number; taxRate: number }>
  payments: Array<{ amount: number; mode: string; paidAt: string }>
  status:   string
}

export default function InvoicePage({ params }: { params: { invoiceId: string } }) {
  const router = useRouter()
  const [inv,       setInv]       = useState<InvoiceDetail | null>(null)
  const [pdfData,   setPdfData]   = useState<PdfData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  // Payment form state
  const [payAmount,    setPayAmount]    = useState('')
  const [payMode,      setPayMode]      = useState<PaymentMode>('UPI')
  const [isRecording,  setIsRecording]  = useState(false)
  const [payError,     setPayError]     = useState<string | null>(null)
  const [lastPayment,  setLastPayment]  = useState<{ amount: number; mode: string } | null>(null)

  // Finalize state
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/invoices/${params.invoiceId}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/invoices/${params.invoiceId}/pdf`).then((r) => r.ok ? r.json() : null),
    ]).then(([invoiceData, pdf]) => {
      if (!invoiceData) { router.replace('/billing'); return }
      setInv(invoiceData)
      setPdfData(pdf)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [params.invoiceId, router])

  useEffect(() => {
    if (!inv) return
    const subtotal = inv.invoice_lines.reduce((s, l) => s + l.amount, 0)
    const gst      = inv.invoice_lines.reduce((s, l) => s + l.amount * (l.tax_rate / 100), 0)
    const total    = subtotal + gst
    const paid     = inv.payments.reduce((s, p) => s + p.amount, 0)
    const due      = total - paid
    if (due > 0 && pdfData && inv.status !== 'DRAFT') {
      buildUpiQrDataUrl('vedadental@upi', CLINIC_NAME, due, `Invoice ${pdfData.invoiceNumber}`)
        .then(setQrDataUrl)
    } else {
      setQrDataUrl(null)
    }
  }, [inv, pdfData])

  async function handleFinalize() {
    setIsFinalizing(true)
    setFinalizeError(null)
    const res = await fetch(`/api/invoices/${params.invoiceId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'finalize' }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setFinalizeError(body.error ?? 'Failed to finalize')
      setIsFinalizing(false)
      return
    }
    // Refresh both invoice + pdf data
    const [invoiceData, pdf] = await Promise.all([
      fetch(`/api/invoices/${params.invoiceId}`).then(r => r.json()),
      fetch(`/api/invoices/${params.invoiceId}/pdf`).then(r => r.json()),
    ])
    setInv(invoiceData)
    setPdfData(pdf)
    setIsFinalizing(false)
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) { setPayError('Enter a valid amount'); return }
    setIsRecording(true)
    setPayError(null)

    const res = await fetch(`/api/invoices/${params.invoiceId}/payments`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ amount, mode: payMode }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setPayError(body.error ?? 'Failed to record payment')
      setIsRecording(false)
      return
    }

    const { invoice_status } = await res.json()
    const recorded = { amount, mode: payMode }
    fetch(`/api/invoices/${params.invoiceId}`)
      .then((r) => r.json())
      .then((d) => {
        setInv(d)
        if (invoice_status === 'PAID') setQrDataUrl(null)
        setLastPayment(recorded)
      })
    setPayAmount('')
    setIsRecording(false)
  }

  if (isLoading) return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
  if (!inv) return null

  const subtotal = inv.invoice_lines.reduce((s, l) => s + l.amount, 0)
  const gst      = inv.invoice_lines.reduce((s, l) => s + l.amount * (l.tax_rate / 100), 0)
  const total    = subtotal + gst
  const paid     = inv.payments.reduce((s, p) => s + p.amount, 0)
  const due      = total - paid
  const isDraft  = inv.status === 'DRAFT'

  const pdfProps = pdfData && !isDraft ? { ...pdfData, upiQrDataUrl: qrDataUrl } : null

  const receiptWaUrl = (() => {
    if (!lastPayment || !inv.patients) return null
    const digits  = inv.patients.phone.replace(/\D/g, '')
    const waPhone = digits.startsWith('91') ? digits : `91${digits}`
    const invNum  = pdfData?.invoiceNumber ?? inv.id.slice(0, 8).toUpperCase()
    const balance = Math.max(0, due)
    const msg = `Dear ${inv.patients.name}, ₹${lastPayment.amount.toFixed(0)} received via ${lastPayment.mode} at ${CLINIC_NAME}. Invoice: ${invNum}. Balance: ₹${balance.toFixed(0)}. Thank you! — 07660966674`
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`
  })()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/billing" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-3.5 w-3.5" /> Billing
      </Link>

      {/* DRAFT banner */}
      {isDraft && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-yellow-800">Draft Invoice — Not Yet Issued</p>
              <p className="mt-0.5 text-xs text-yellow-700">
                This invoice is not counted in revenue or receivables until you finalize it.
                Once finalized, it is locked and a payment can be recorded.
              </p>
              {finalizeError && <p className="mt-1 text-xs text-danger">{finalizeError}</p>}
            </div>
            <button
              type="button"
              onClick={handleFinalize}
              disabled={isFinalizing}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 disabled:opacity-60"
            >
              {isFinalizing
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <CheckCircle2 className="h-3.5 w-3.5" />}
              {isFinalizing ? 'Finalizing…' : 'Finalize Invoice'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between rounded-lg border border-border bg-background p-5">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            {isDraft ? 'DRAFT — not issued' : (pdfData?.invoiceNumber ?? inv.id.slice(0, 8).toUpperCase())}
          </p>
          <h2 className="text-lg font-semibold text-foreground">{inv.patients?.name ?? '—'}</h2>
          <p className="text-sm text-muted-foreground">
            {isDraft ? 'Pending finalization' : formatDate(inv.issued_at)} · {inv.patients?.phone}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', STATUS_STYLE[inv.status])}>
            {STATUS_LABEL[inv.status]}
          </span>
          {pdfProps && qrDataUrl && (
            <PdfDownloadButton
              pdfProps={pdfProps}
              fileName={`${pdfData?.invoiceNumber ?? 'invoice'}-${inv.patients?.name?.replace(/\s+/g, '-') ?? 'patient'}.pdf`}
            />
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-lg border border-border bg-background">
        <div className="grid grid-cols-[1fr_80px_60px_80px] gap-3 border-b border-border bg-surface px-5 py-2.5">
          {['Description', 'Amount', 'GST', 'Total'].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right first:text-left">{h}</span>
          ))}
        </div>
        {inv.invoice_lines.map((line) => {
          const tax = line.amount * (line.tax_rate / 100)
          return (
            <div key={line.id} className="grid grid-cols-[1fr_80px_60px_80px] gap-3 border-b border-border px-5 py-3 last:border-b-0">
              <span className="text-sm text-foreground">{line.description}</span>
              <span className="text-right text-sm text-foreground">{formatCurrency(line.amount)}</span>
              <span className="text-right text-sm text-muted-foreground">{line.tax_rate}%</span>
              <span className="text-right text-sm font-medium text-foreground">{formatCurrency(line.amount + tax)}</span>
            </div>
          )
        })}
        <div className="flex flex-col items-end gap-1 border-t border-border px-5 py-4">
          <div className="flex w-48 justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex w-48 justify-between text-sm text-muted-foreground"><span>GST</span><span>{formatCurrency(gst)}</span></div>
          <div className="flex w-48 justify-between text-sm text-muted-foreground"><span>Paid</span><span>− {formatCurrency(paid)}</span></div>
          <div className="flex w-48 justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
            <span>{isDraft ? 'Total (draft)' : 'Due'}</span>
            <span>{formatCurrency(isDraft ? total : due)}</span>
          </div>
        </div>
      </div>

      {/* Payments + QR — hidden for DRAFT */}
      {!isDraft && (
        <div className="flex gap-4">
          <div className="flex-1 space-y-3 rounded-lg border border-border bg-background p-5">
            <p className="text-sm font-semibold text-foreground">Payment History</p>
            {inv.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded</p>
            ) : (
              <div className="space-y-1">
                {inv.payments.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{formatDate(p.paid_at)} · {p.mode}</span>
                    <span className="font-medium text-success">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Record payment */}
            {due > 0 && inv.status !== 'CANCELLED' && (
              <form onSubmit={handleRecordPayment} className="mt-3 space-y-2 border-t border-border pt-3">
                <p className="text-xs font-semibold text-foreground">Record Payment</p>
                <div className="flex gap-2">
                  <input
                    type="number" min="1" step="0.01" value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={`Amount (max ${due.toFixed(2)})`}
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as PaymentMode)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {payError && <p className="text-xs text-danger">{payError}</p>}
                <button
                  type="submit" disabled={isRecording}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {isRecording ? 'Recording…' : 'Record'}
                </button>
              </form>
            )}

            {/* WhatsApp receipt after payment recorded */}
            {receiptWaUrl && (
              <div className="mt-3 border-t border-border pt-3">
                <a
                  href={receiptWaUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Send Receipt via WhatsApp
                </a>
              </div>
            )}
          </div>

          {due > 0 && (
            <div className="rounded-lg border border-border bg-background p-5">
              <p className="mb-3 text-sm font-semibold text-foreground">Pay Now</p>
              <UpiQrCode
                vpa="vedadental@upi"
                payeeName={CLINIC_NAME}
                amount={due}
                note={`Invoice ${pdfData?.invoiceNumber ?? ''}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
