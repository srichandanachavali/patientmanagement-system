'use client'
// ── F171 · src/app/(app)/billing/new/page.tsx
// Purpose: New invoice — patient search/select via PatientPicker, then line items; POST /api/invoices
// In: PatientPicker (F193), InvoiceForm (F173), POST /api/invoices (F082) | Out: NewInvoicePage | See: F170, F173, F193

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PatientPicker, type PatientOption } from '@/components/billing/PatientPicker'
import { InvoiceForm, type InvoiceFormValues } from '@/components/billing/InvoiceForm'

export default function NewInvoicePage() {
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)
  const [isSubmitting, setIsSubmitting]       = useState(false)
  const [error, setError]                     = useState<string | null>(null)

  async function handleSubmit(data: InvoiceFormValues) {
    if (!selectedPatient) {
      setError('Please select a patient before saving the invoice.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: selectedPatient.id,
        lines: data.lines.map((l) => ({
          description: l.description,
          amount:      l.amount,
          tax_rate:    l.taxRate,
        })),
        notes: data.notes,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to create invoice')
      setIsSubmitting(false)
      return
    }

    const invoice = await res.json()
    router.push(`/billing/${invoice.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/billing"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Billing
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium text-foreground">New Invoice</span>
      </div>

      <h2 className="text-base font-semibold text-foreground">Create Invoice</h2>

      {error && (
        <div className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">{error}</div>
      )}

      {/* Step 1 — select patient */}
      <section className="rounded-lg border border-border bg-background p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Step 1 — Select Patient</h3>
        <PatientPicker selected={selectedPatient} onSelect={setSelectedPatient} />
      </section>

      {/* Step 2 — line items (locked until patient selected) */}
      <section className="rounded-lg border border-border bg-background p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Step 2 — Line Items</h3>
        <InvoiceForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={!selectedPatient}
        />
      </section>
    </div>
  )
}
