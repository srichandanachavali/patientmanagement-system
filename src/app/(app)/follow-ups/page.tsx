'use client'
// ── F204 · src/app/(app)/follow-ups/page.tsx
// Purpose: Follow-ups dashboard — today / this week / overdue grouped view + quick status update + wa.me
// In: GET /api/follow-ups (F202) | Out: FollowUpsPage | See: F202, F203

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MessageCircle, CheckCircle2, XCircle, Clock, AlertTriangle, Plus, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FollowUp {
  id: string
  patientId: string
  reason: string
  scheduledDate: string
  status: string
  notes: string | null
  patient: { id: string; name: string; phone: string; preferredLanguage: string }
}

const REASON_OPTIONS = [
  'Post-extraction review',
  'RCT follow-up',
  'Implant healing check',
  'Suture removal',
  'Post-op pain check',
  'Crown cementation review',
  'Orthodontic adjustment',
  'Bleaching review',
  'Scaling follow-up',
  'General review',
  'Other',
]

function waLink(phone: string, name: string, reason: string, date: string, lang: string) {
  const d = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' })
  const msg = lang === 'te'
    ? `నమస్కారం ${name} గారు, మీ ${reason} follow-up ${d} న VEDA Dental Clinic లో నిర్ణయించబడింది. దయచేసి confirm చేయండి — 07660966674`
    : `Dear ${name}, your follow-up (${reason}) is scheduled on ${d} at VEDA Super Speciality Dental Clinic. Please confirm — 07660966674`
  const p = phone.replace(/\D/g, '')
  const intl = p.startsWith('91') ? p : `91${p}`
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`
}

function FollowUpRow({ fu, onStatusChange }: { fu: FollowUp; onStatusChange: (id: string, s: string) => void }) {
  const d = new Date(fu.scheduledDate)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const isPast = d < todayStart && fu.status === 'PENDING'

  return (
    <div className={cn(
      'flex items-start gap-4 rounded-lg border p-4 transition-colors',
      isPast ? 'border-danger/40 bg-danger-bg/30' : 'border-border bg-background',
    )}>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/patients/${fu.patientId}`} className="text-sm font-semibold text-foreground hover:text-primary hover:underline">
            {fu.patient.name}
          </Link>
          {fu.patient.preferredLanguage === 'te' && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-medium text-amber-700">తెలుగు</span>
          )}
          <span className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            fu.status === 'PENDING' && !isPast ? 'bg-info/10 text-info' :
            fu.status === 'DONE'   ? 'bg-success/10 text-success' :
            'bg-danger-bg text-danger',
          )}>
            {fu.status}
          </span>
          {isPast && <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">OVERDUE</span>}
        </div>
        <p className="text-xs text-muted-foreground">{fu.reason}</p>
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
        {fu.notes && <p className="text-[11px] text-muted-foreground italic">{fu.notes}</p>}
      </div>

      <div className="flex shrink-0 flex-col gap-1.5">
        {/* WhatsApp reminder */}
        {fu.status === 'PENDING' && (
          <a
            href={waLink(fu.patient.phone, fu.patient.name, fu.reason, fu.scheduledDate, fu.patient.preferredLanguage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-[#25D366]/40 bg-[#25D366]/5 px-2.5 py-1.5 text-[11px] font-medium text-[#128C7E] hover:bg-[#25D366]/15"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Remind
          </a>
        )}
        {fu.status === 'PENDING' && (
          <button
            type="button"
            onClick={() => onStatusChange(fu.id, 'DONE')}
            className="flex items-center gap-1 rounded-md border border-success/40 bg-success/5 px-2.5 py-1.5 text-[11px] font-medium text-success hover:bg-success/15"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark done
          </button>
        )}
        {fu.status === 'PENDING' && isPast && (
          <button
            type="button"
            onClick={() => onStatusChange(fu.id, 'MISSED')}
            className="flex items-center gap-1 rounded-md border border-danger/30 bg-danger-bg/50 px-2.5 py-1.5 text-[11px] font-medium text-danger hover:bg-danger-bg"
          >
            <XCircle className="h-3.5 w-3.5" />
            Missed
          </button>
        )}
      </div>
    </div>
  )
}

function AddFollowUpModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [patientQuery, setPatientQuery]     = useState('')
  const [patients, setPatients]             = useState<{ id: string; name: string; phone: string }[]>([])
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
  const [reason, setReason]                 = useState(REASON_OPTIONS[0])
  const [customReason, setCustomReason]     = useState('')
  const [date, setDate]                     = useState('')
  const [notes, setNotes]                   = useState('')
  const [saving, setSaving]                 = useState(false)

  useEffect(() => {
    if (!patientQuery.trim()) { setPatients([]); return }
    const id = setTimeout(() => {
      fetch(`/api/patients?q=${encodeURIComponent(patientQuery)}`)
        .then(r => r.json())
        .then((d: { id: string; name: string; phone: string }[]) => setPatients(d.slice(0, 6)))
    }, 300)
    return () => clearTimeout(id)
  }, [patientQuery])

  const finalReason = reason === 'Other' ? customReason : reason

  const submit = async () => {
    if (!selectedPatient || !finalReason || !date) return
    setSaving(true)
    await fetch('/api/follow-ups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: selectedPatient.id, reason: finalReason, scheduledDate: date, notes }),
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-foreground">New Follow-up</h2>

        {/* Patient search */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Patient</label>
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-md border border-success/40 bg-success/5 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">{selectedPatient.name}</span>
              <button type="button" onClick={() => setSelectedPatient(null)} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={patientQuery}
                onChange={e => setPatientQuery(e.target.value)}
                placeholder="Search patient name…"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
              {patients.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-border bg-background shadow-md">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSelectedPatient(p); setPatientQuery(''); setPatients([]) }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface"
                    >
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="text-muted-foreground">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reason */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Reason</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            {REASON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          {reason === 'Other' && (
            <input
              type="text"
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder="Describe the follow-up…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
            />
          )}
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Scheduled date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Clinical notes for this follow-up…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={submit}
            disabled={saving || !selectedPatient || !finalReason || !date}
            className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Schedule follow-up'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FollowUpsPage() {
  const [overdue, setOverdue]   = useState<FollowUp[]>([])
  const [today, setToday]       = useState<FollowUp[]>([])
  const [week, setWeek]         = useState<FollowUp[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [od, td, wk] = await Promise.all([
      fetch('/api/follow-ups?due=overdue').then(r => r.json()),
      fetch('/api/follow-ups?due=today').then(r => r.json()),
      fetch('/api/follow-ups?due=week').then(r => r.json()),
    ])
    setOverdue(od as FollowUp[])
    setToday(td as FollowUp[])
    // week includes today; deduplicate
    const todayIds = new Set((td as FollowUp[]).map(f => f.id))
    setWeek((wk as FollowUp[]).filter(f => !todayIds.has(f.id)))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = useCallback(async (id: string, status: string) => {
    await fetch(`/api/follow-ups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }, [load])

  const totalPending = overdue.length + today.length + week.length

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-foreground">Follow-ups</h1>
          <p className="text-xs text-muted-foreground">
            {totalPending} pending · {overdue.length > 0 && (
              <span className="font-medium text-danger">{overdue.length} overdue</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Schedule follow-up
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="space-y-6">
          {/* Overdue */}
          {overdue.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <h2 className="text-sm font-semibold text-danger">Overdue ({overdue.length})</h2>
              </div>
              <div className="space-y-2">
                {overdue.map(fu => <FollowUpRow key={fu.id} fu={fu} onStatusChange={updateStatus} />)}
              </div>
            </section>
          )}

          {/* Today */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">Due today ({today.length})</h2>
            </div>
            {today.length === 0 ? (
              <p className="rounded-lg border border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
                No follow-ups due today.
              </p>
            ) : (
              <div className="space-y-2">
                {today.map(fu => <FollowUpRow key={fu.id} fu={fu} onStatusChange={updateStatus} />)}
              </div>
            )}
          </section>

          {/* Rest of week */}
          {week.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Later this week ({week.length})</h2>
              </div>
              <div className="space-y-2">
                {week.map(fu => <FollowUpRow key={fu.id} fu={fu} onStatusChange={updateStatus} />)}
              </div>
            </section>
          )}

          {totalPending === 0 && (
            <div className="rounded-lg border border-border bg-background py-12 text-center">
              <p className="text-sm font-medium text-foreground">All clear!</p>
              <p className="text-xs text-muted-foreground">No pending follow-ups this week.</p>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <AddFollowUpModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load() }}
        />
      )}
    </div>
  )
}
