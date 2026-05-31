'use client'
// ── F195 · src/app/(app)/lab/[id]/page.tsx
// Purpose: Lab case detail — status progression, dentist notes, lab assistant notes, dates
// In: GET/PATCH /api/lab/[id] (F071) | Out: LabCaseDetailPage | See: F070, F071, F182

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, FlaskConical, User, Calendar, IndianRupee } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LAB_CASE_STATUSES } from '@/constants/enums'
import type { LabCaseStatus } from '@/types'

interface LabCaseDetail {
  id: string
  patient_id: string
  patient_name: string
  patient_phone: string
  case_type: string
  tooth_numbers: string | null
  material: string | null
  shade: string | null
  lab_name: string | null
  dentist_notes: string | null
  lab_assistant_notes: string | null
  cost: number | null
  status: string
  sent_at: string | null
  expected_at: string | null
  delivered_at: string | null
  created_by_name: string | null
  created_at: string
  updated_at: string
}

const STATUS_CLS: Record<string, string> = {
  'Planned':          'bg-secondary text-secondary-foreground',
  'Impression Taken': 'bg-info/15 text-info',
  'Sent to Lab':      'bg-warning/15 text-warning',
  'Received':         'bg-success/15 text-success',
  'Fitted/Delivered': 'bg-success/30 text-success',
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  })
}

function toInputDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toISOString().substring(0, 10)
}

function isOverdue(lc: LabCaseDetail) {
  if (!lc.expected_at) return false
  if (lc.status === 'Received' || lc.status === 'Fitted/Delivered') return false
  return new Date(lc.expected_at) < new Date()
}

export default function LabCaseDetailPage({ params }: { params: { id: string } }) {
  const [lc, setLc]                     = useState<LabCaseDetail | null>(null)
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [saveStatus, setSaveStatus]     = useState<'idle' | 'saved' | 'error'>('idle')

  // Editable fields
  const [status, setStatus]             = useState<LabCaseStatus>('Planned')
  const [labNotes, setLabNotes]         = useState('')
  const [sentAt, setSentAt]             = useState('')
  const [expectedAt, setExpectedAt]     = useState('')
  const [deliveredAt, setDeliveredAt]   = useState('')

  useEffect(() => {
    fetch(`/api/lab/${params.id}`)
      .then((r) => r.json())
      .then((data: LabCaseDetail) => {
        setLc(data)
        setStatus(data.status as LabCaseStatus)
        setLabNotes(data.lab_assistant_notes ?? '')
        setSentAt(toInputDate(data.sent_at))
        setExpectedAt(toInputDate(data.expected_at))
        setDeliveredAt(toInputDate(data.delivered_at))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  async function handleSave() {
    setSaving(true); setSaveStatus('idle')
    const res = await fetch(`/api/lab/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        lab_assistant_notes: labNotes,
        sent_at:      sentAt      || null,
        expected_at:  expectedAt  || null,
        delivered_at: deliveredAt || null,
      }),
    })
    if (res.ok) {
      const updated: LabCaseDetail = await res.json()
      setLc(updated)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } else {
      setSaveStatus('error')
    }
    setSaving(false)
  }

  if (loading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
  }
  if (!lc) {
    return <p className="py-8 text-center text-sm text-danger">Lab case not found.</p>
  }

  const overdueFlag = isOverdue(lc)

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/lab" className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="h-3.5 w-3.5" />
          Lab Cases
        </Link>
        <span>/</span>
        <Link href={`/patients/${lc.patient_id}`} className="hover:text-foreground">
          {lc.patient_name}
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{lc.case_type}</span>
      </div>

      {/* Header card */}
      <div className={cn(
        'rounded-lg border p-5',
        overdueFlag ? 'border-danger/40 bg-danger-bg/30' : 'border-border bg-background',
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{lc.case_type}</h2>
              <p className="text-xs text-muted-foreground">
                {lc.tooth_numbers ? `Teeth: ${lc.tooth_numbers}` : 'No teeth specified'}
                {lc.material && ` · ${lc.material}`}
                {lc.shade && ` · Shade ${lc.shade}`}
              </p>
            </div>
          </div>
          <span className={cn(
            'shrink-0 rounded px-2.5 py-1 text-[11px] font-semibold',
            STATUS_CLS[lc.status] ?? 'bg-secondary text-secondary-foreground',
          )}>
            {lc.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3.5 w-3.5 shrink-0" />
            <Link href={`/patients/${lc.patient_id}`} className="hover:text-primary hover:underline">
              {lc.patient_name}
            </Link>
          </div>
          {lc.lab_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FlaskConical className="h-3.5 w-3.5 shrink-0" />
              {lc.lab_name}
            </div>
          )}
          {lc.cost !== null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="h-3.5 w-3.5 shrink-0" />
              {lc.cost.toLocaleString('en-IN')}
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Sent: {fmtDate(lc.sent_at)}
          </div>
          <div className={cn(
            'flex items-center gap-2',
            overdueFlag ? 'font-semibold text-danger' : 'text-muted-foreground',
          )}>
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Expected: {fmtDate(lc.expected_at)}
            {overdueFlag && ' ⚠'}
          </div>
          {lc.delivered_at && (
            <div className="flex items-center gap-2 text-success">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              Received: {fmtDate(lc.delivered_at)}
            </div>
          )}
        </div>
      </div>

      {/* Status progression */}
      <div className="rounded-lg border border-border bg-background p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Status Progression</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {LAB_CASE_STATUSES.map((s, i) => {
            const currentIdx = LAB_CASE_STATUSES.indexOf(status as LabCaseStatus)
            const isPast     = i < currentIdx
            const isCurrent  = s === status
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  isCurrent
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isPast
                      ? 'border-success/40 bg-success/10 text-success'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                )}
              >
                {s}
              </button>
            )
          })}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Date sent
            </label>
            <input
              type="date"
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={sentAt}
              onChange={(e) => setSentAt(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Expected back
            </label>
            <input
              type="date"
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={expectedAt}
              onChange={(e) => setExpectedAt(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Date received
            </label>
            <input
              type="date"
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={deliveredAt}
              onChange={(e) => setDeliveredAt(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Notes side by side */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Dentist instructions (read-only in this view) */}
        <div className="rounded-lg border border-border bg-background p-5">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Dentist Instructions</h3>
          {lc.dentist_notes ? (
            <p className="whitespace-pre-wrap text-sm text-foreground">{lc.dentist_notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No instructions recorded.</p>
          )}
        </div>

        {/* Lab assistant notes (editable) */}
        <div className="rounded-lg border border-border bg-background p-5">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Lab Assistant Notes</h3>
          <p className="mb-2 text-[10px] text-muted-foreground">
            Record progress, issues, or delivery notes here.
          </p>
          <textarea
            rows={4}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Add notes…"
            value={labNotes}
            onChange={(e) => setLabNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saveStatus === 'saved' && (
          <span className="text-sm text-success">Saved.</span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-danger">Save failed.</span>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground">
          Created by {lc.created_by_name ?? '—'} · {fmtDate(lc.created_at)}
        </span>
      </div>
    </div>
  )
}
