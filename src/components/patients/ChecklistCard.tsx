'use client'
// ── F201 · src/components/patients/ChecklistCard.tsx
// Purpose: Patient safety checklist — mandatory items gate readyForTreatment; full clinical pre-treatment form
// In: patientId | Out: ChecklistCard | See: F200, F142

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Checklist {
  id: string
  patientId: string
  drugAllergiesConfirmed: boolean
  consentRecorded: boolean
  chiefComplaintNoted: boolean
  medicalHistoryReviewed: boolean
  bpStatus: string | null
  diabeticStatus: string | null
  bleedingDisorder: boolean
  pregnancyStatus: string | null
  currentMedications: string | null
  dentalHistoryReviewed: boolean
  tobaccoHabit: string | null
  lastXrayDate: string | null
  lastXrayType: string | null
  readyForTreatment: boolean
  lastReviewedAt: string | null
}

const EMPTY: Omit<Checklist, 'id' | 'patientId' | 'readyForTreatment' | 'lastReviewedAt'> = {
  drugAllergiesConfirmed: false,
  consentRecorded: false,
  chiefComplaintNoted: false,
  medicalHistoryReviewed: false,
  bpStatus: null,
  diabeticStatus: null,
  bleedingDisorder: false,
  pregnancyStatus: null,
  currentMedications: null,
  dentalHistoryReviewed: false,
  tobaccoHabit: null,
  lastXrayDate: null,
  lastXrayType: null,
}

function Toggle({ label, checked, onChange, mandatory }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; mandatory?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center gap-2.5 rounded-md border px-3 py-2 text-left text-xs transition-colors w-full',
        checked
          ? 'border-success/40 bg-success/5 text-foreground'
          : mandatory
            ? 'border-danger/40 bg-danger-bg/60 text-foreground'
            : 'border-border bg-background text-foreground hover:border-primary/40',
      )}
    >
      {checked
        ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        : mandatory
          ? <XCircle className="h-4 w-4 shrink-0 text-danger" />
          : <XCircle className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
      <span className={cn('flex-1', mandatory && !checked && 'font-medium text-danger')}>{label}</span>
      {mandatory && <span className="text-[10px] font-semibold text-danger">REQUIRED</span>}
    </button>
  )
}

function Select({ label, value, options, onChange }: {
  label: string; value: string | null; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">— Not recorded —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function ChecklistCard({ patientId }: { patientId: string }) {
  const [data, setData]       = useState<Partial<Checklist>>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch(`/api/patients/${patientId}/checklist`)
      .then(r => r.json())
      .then((d: Checklist | null) => {
        setData(d ?? EMPTY)
        setLoading(false)
        // Auto-expand if mandatory items incomplete
        if (!d?.readyForTreatment) setExpanded(true)
      })
      .catch(() => setLoading(false))
  }, [patientId])

  const save = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/patients/${patientId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const updated = await res.json() as Checklist
      setData(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }, [patientId, data])

  const patch = (key: keyof typeof data, val: unknown) =>
    setData(prev => ({ ...prev, [key]: val }))

  const mandatoryDone = data.drugAllergiesConfirmed && data.consentRecorded && data.chiefComplaintNoted
  const ready = data.readyForTreatment

  return (
    <div className={cn(
      'rounded-lg border bg-background',
      ready ? 'border-success/40' : 'border-warning/50',
    )}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className={cn('h-4 w-4', ready ? 'text-success' : 'text-warning')} />
          <h3 className="text-sm font-semibold text-foreground">Pre-treatment Safety Checklist</h3>
          {!loading && (
            <span className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
              ready ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
            )}>
              {ready ? 'Ready for treatment' : 'Incomplete — review required'}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {/* Mandatory items always visible if not done */}
      {!loading && !ready && !expanded && (
        <div className="border-t border-border px-5 py-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            Required before treatment:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {!data.drugAllergiesConfirmed && (
              <span className="rounded-full bg-danger-bg px-2.5 py-0.5 text-[10px] font-medium text-danger">Drug allergies not confirmed</span>
            )}
            {!data.consentRecorded && (
              <span className="rounded-full bg-danger-bg px-2.5 py-0.5 text-[10px] font-medium text-danger">Consent not recorded</span>
            )}
            {!data.chiefComplaintNoted && (
              <span className="rounded-full bg-danger-bg px-2.5 py-0.5 text-[10px] font-medium text-danger">Chief complaint missing</span>
            )}
          </div>
        </div>
      )}

      {/* Expanded form */}
      {expanded && !loading && (
        <div className="border-t border-border px-5 py-4 space-y-5">
          {/* Section: Mandatory safety */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-danger">
              Mandatory — treatment blocked until complete
            </p>
            <div className="space-y-1.5">
              <Toggle label="Drug allergies confirmed with patient" checked={!!data.drugAllergiesConfirmed} onChange={v => patch('drugAllergiesConfirmed', v)} mandatory />
              <Toggle label="Consent (CLINICAL) recorded in system" checked={!!data.consentRecorded} onChange={v => patch('consentRecorded', v)} mandatory />
              <Toggle label="Chief complaint documented" checked={!!data.chiefComplaintNoted} onChange={v => patch('chiefComplaintNoted', v)} mandatory />
            </div>
          </div>

          {/* Section: Medical safety flags */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Medical history & safety flags
            </p>
            <div className="mb-2.5">
              <Toggle label="Full medical history reviewed" checked={!!data.medicalHistoryReviewed} onChange={v => patch('medicalHistoryReviewed', v)} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Select
                label="Blood pressure"
                value={data.bpStatus ?? null}
                options={['Normal', 'Hypertensive', 'Hypotensive', 'Unknown']}
                onChange={v => patch('bpStatus', v || null)}
              />
              <Select
                label="Diabetic status"
                value={data.diabeticStatus ?? null}
                options={['No', 'Type 1', 'Type 2', 'Pre-diabetic', 'Unknown']}
                onChange={v => patch('diabeticStatus', v || null)}
              />
              <Select
                label="Pregnancy"
                value={data.pregnancyStatus ?? null}
                options={['N/A', 'Yes', 'No', 'Unknown']}
                onChange={v => patch('pregnancyStatus', v || null)}
              />
              <div className="flex items-end">
                <Toggle label="Bleeding disorder / anticoagulants" checked={!!data.bleedingDisorder} onChange={v => patch('bleedingDisorder', v)} />
              </div>
            </div>
            <div className="mt-2.5 space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Current medications</label>
              <input
                type="text"
                value={data.currentMedications ?? ''}
                onChange={e => patch('currentMedications', e.target.value || null)}
                placeholder="e.g. Metformin, Warfarin…"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Dental history */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Dental history
            </p>
            <div className="mb-2.5">
              <Toggle label="Dental history reviewed" checked={!!data.dentalHistoryReviewed} onChange={v => patch('dentalHistoryReviewed', v)} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Select
                label="Tobacco / areca habit"
                value={data.tobaccoHabit ?? null}
                options={['None', 'Smoking', 'Chewing tobacco', 'Areca nut', 'Multiple']}
                onChange={v => patch('tobaccoHabit', v || null)}
              />
              <Select
                label="Last X-ray type"
                value={data.lastXrayType ?? null}
                options={['OPG', 'IOPA', 'Bitewing', 'CBCT']}
                onChange={v => patch('lastXrayType', v || null)}
              />
            </div>
            <div className="mt-2.5 space-y-1">
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Last X-ray date</label>
              <input
                type="date"
                value={data.lastXrayDate ? data.lastXrayDate.substring(0, 10) : ''}
                onChange={e => patch('lastXrayDate', e.target.value || null)}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save checklist'}
          </button>

          {data.lastReviewedAt && (
            <p className="text-[11px] text-muted-foreground">
              Last reviewed: {new Date(data.lastReviewedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
