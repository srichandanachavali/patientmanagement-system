'use client'
// ── F170 · src/app/(app)/billing/page.tsx
// Purpose: Invoice list — fetches /api/invoices, shows status + outstanding balance per patient
// In: GET /api/invoices (F082), formatCurrency/formatDate (F012) | Out: BillingPage | See: F171, F172
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { InvoiceStatus } from '@/types'

interface InvoiceSummary {
  id: string
  issued_at: string
  status: InvoiceStatus
  outstanding: number
  patients: { id: string; name: string; phone: string } | null
}

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

export default function BillingPage() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/invoices')
      .then((r) => r.json())
      .then((data) => { setInvoices(Array.isArray(data) ? data : []); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  const totalOutstanding = invoices.reduce((s, inv) => s + inv.outstanding, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Billing</h2>
          {!isLoading && invoices.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === 'DRAFT').length > 0 && (
                <span className="mr-2 text-yellow-600 font-medium">
                  {invoices.filter(i => i.status === 'DRAFT').length} draft ·
                </span>
              )}
              {invoices.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED' && i.status !== 'DRAFT').length} issued open ·{' '}
              <span className="text-warning font-medium">{formatCurrency(totalOutstanding)} outstanding</span>
            </p>
          )}
        </div>
        <Link
          href="/billing/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          New Invoice
        </Link>
      </div>

      {/* Invoice list */}
      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : invoices.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No invoices yet.</p>
      ) : (
        <div className="rounded-lg border border-border bg-background">
          <div className="grid grid-cols-[1fr_120px_120px_100px] gap-3 border-b border-border bg-surface px-5 py-2.5">
            {['Patient', 'Date', 'Outstanding', 'Status'].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground last:text-right">
                {h}
              </span>
            ))}
          </div>

          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/billing/${inv.id}`}
              className={cn(
                'grid grid-cols-[1fr_120px_120px_100px] gap-3 border-b border-border px-5 py-3 last:border-b-0 hover:bg-surface transition-colors',
                inv.status === 'DRAFT' && 'opacity-70',
              )}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{inv.patients?.name ?? '—'}</p>
                <p className="text-xs text-muted-foreground">
                  {inv.patients?.phone}
                  {inv.status === 'DRAFT' && <span className="ml-2 italic text-yellow-600">not yet issued</span>}
                </p>
              </div>
              <span className="self-center text-sm text-muted-foreground">
                {inv.status === 'DRAFT' ? '—' : formatDate(inv.issued_at)}
              </span>
              <span className={cn(
                'self-center text-sm font-medium',
                inv.status === 'DRAFT' ? 'text-muted-foreground italic' : inv.outstanding > 0 ? 'text-warning' : 'text-success',
              )}>
                {inv.status === 'DRAFT' ? 'Draft' : formatCurrency(inv.outstanding)}
              </span>
              <div className="flex items-center justify-end">
                <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', STATUS_STYLE[inv.status])}>
                  {STATUS_LABEL[inv.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
