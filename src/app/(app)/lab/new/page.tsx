'use client'
// ── F194 · src/app/(app)/lab/new/page.tsx
// Purpose: New lab case form — patient search/select, case details, POST /api/lab
// In: PatientPicker (F193), POST /api/lab (F070) | Out: NewLabCasePage | See: F070, F182, F193

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PatientPicker, type PatientOption } from '@/components/billing/PatientPicker'
import { LAB_CASE_STATUSES, LAB_CASE_TYPES } from '@/constants/enums'
import { Suspense } from 'react'

const inputCls =
  'rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 w-full'

const MATERIALS = ['PFM', 'Zirconia', 'Full Metal', 'E-max', 'Acrylic', 'Composite', 'Other']
const SHADES    = ['A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'D2', 'Bleach']

function NewLabCaseForm() {
  const router         = useRouter()
  const searchParams   = useSearchParams()
  const prefillId      = searchParams.get('patientId')
  const prefillName    = searchParams.get('patientName')
  const prefillPhone   = searchParams.get('patientPhone')

  const initialPatient: PatientOption | null =
    prefillId && prefillName && prefillPhone
      ? { id: prefillId, name: decodeURIComponent(prefillName), phone: decodeURIComponent(prefillPhone) }
      : null

  const [patient, setPatient]       = useState<PatientOption | null>(initialPatient)
  const [caseType, setCaseType]     = useState(LAB_CASE_TYPES[0])
  const [toothNums, setToothNums]   = useState('')
  const [material, setMaterial]     = useState('')
  const [shade, setShade]           = useState('')
  const [labName, setLabName]       = useState('')
  const [dentistNotes, setDentistNotes] = useState('')
  const [cost, setCost]             = useState('')
  const [status, setStatus]         = useState(LAB_CASE_STATUSES[0])
  const [expectedAt, setExpectedAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patient) { setError('Select a patient first.'); return }
    setSubmitting(true); setError(null)

    const res = await fetch('/api/lab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id:    patient.id,
        case_type:     caseType,
        tooth_numbers: toothNums.trim() || null,
        material:      material.trim()  || null,
        shade:         shade.trim()     || null,
        lab_name:      labName.trim()   || null,
        dentist_notes: dentistNotes.trim() || null,
        cost:          cost ? Number(cost) : null,
        status,
        expected_at:   expectedAt || null,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to create lab case')
      setSubmitting(false)
      return
    }

    router.push(`/patients/${patient.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <div className="flex items-center gap-2">
        <Link href="/lab" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-3.5 w-3.5" />
          Lab Cases
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium text-foreground">New Lab Case</span>
      </div>

      <h2 className="text-base font-semibold text-foreground">New Lab Case</h2>

      {error && (
        <div className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Patient */}
        <section className="rounded-lg border border-border bg-background p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Patient</h3>
          <PatientPicker selected={patient} onSelect={setPatient} />
        </section>

        {/* Case details */}
        <section className="rounded-lg border border-border bg-background p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Case Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">
                Case type <span className="text-danger">*</span>
              </label>
              <select
                className={inputCls}
                value={caseType}
                onChange={(e) => setCaseType(e.target.value as typeof caseType)}
                required
              >
                {LAB_CASE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">
                Tooth numbers (FDI, comma-separated)
              </label>
              <input
                className={inputCls}
                placeholder="e.g. 36, 37"
                value={toothNums}
                onChange={(e) => setToothNums(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Material</label>
              <select className={inputCls} value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="">— Select material —</option>
                {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Shade</label>
              <select className={inputCls} value={shade} onChange={(e) => setShade(e.target.value)}>
                <option value="">— Select shade —</option>
                {SHADES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Lab name</label>
              <input
                className={inputCls}
                placeholder="e.g. XYZ Dental Lab"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Lab fee (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Expected return date</label>
              <input
                type="date"
                className={inputCls}
                value={expectedAt}
                onChange={(e) => setExpectedAt(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Initial status</label>
              <select
                className={inputCls}
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
              >
                {LAB_CASE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground">
              Dentist instructions to lab
            </label>
            <textarea
              rows={3}
              className={inputCls + ' resize-none'}
              placeholder="Special instructions, contacts, shape details…"
              value={dentistNotes}
              onChange={(e) => setDentistNotes(e.target.value)}
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting || !patient}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating…' : 'Create Lab Case'}
        </button>
        {!patient && (
          <p className="text-[11px] text-muted-foreground">Select a patient to enable submit.</p>
        )}
      </form>
    </div>
  )
}

export default function NewLabCasePage() {
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>}>
      <NewLabCaseForm />
    </Suspense>
  )
}
