'use client'
// ── F152 · src/app/(app)/appointments/[id]/page.tsx
// Purpose: Appointment detail — status flow buttons + bilingual WhatsApp reminder via wa.me link
// In: GET/PATCH /api/appointments/:id, formatDate/formatTime (F012) | Out: AppointmentPage | See: F150, F012, F023

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MessageSquare } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'

const STATUS_OPTIONS: AppointmentStatus[] = [
  'BOOKED', 'CONFIRMED', 'ARRIVED', 'IN_CHAIR', 'COMPLETED', 'NO_SHOW', 'CANCELLED',
]

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  'BOOKED':    'Booked',
  'CONFIRMED': 'Confirmed',
  'ARRIVED':   'Arrived',
  'IN_CHAIR':  'In Chair',
  'COMPLETED': 'Completed',
  'NO_SHOW':   'No-Show',
  'CANCELLED': 'Cancelled',
}

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  'BOOKED':    'bg-secondary text-secondary-foreground',
  'CONFIRMED': 'bg-info/15 text-info',
  'ARRIVED':   'bg-warning/15 text-warning',
  'IN_CHAIR':  'bg-purple-100 text-purple-800',
  'COMPLETED': 'bg-success/15 text-success',
  'NO_SHOW':   'bg-danger-bg text-danger',
  'CANCELLED': 'bg-danger-bg/60 text-danger/70',
}

interface AppointmentData {
  id: string
  start: string
  end: string
  status: AppointmentStatus
  notes: string | null
  chair_id: number
  patients: { id: string; name: string; phone: string; preferred_language: 'te' | 'en' } | null
  profiles: { id: string; name: string } | null
}

export default function AppointmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [appt, setAppt] = useState<AppointmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<AppointmentStatus>('BOOKED')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [waLink, setWaLink] = useState<string | null>(null)
  const [isDraftingReminder, setIsDraftingReminder] = useState(false)

  useEffect(() => {
    fetch(`/api/appointments/${params.id}`)
      .then((r) => {
        if (!r.ok) { router.replace('/appointments'); return null }
        return r.json()
      })
      .then((d) => {
        if (!d) return
        setAppt(d)
        setStatus(d.status)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [params.id, router])

  async function handleStatusSave() {
    setIsSaving(true)
    setSaveError(null)
    const res = await fetch(`/api/appointments/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setSaveError(body.error ?? 'Failed to update status')
    } else {
      const updated = await res.json()
      setAppt((prev) => prev ? { ...prev, status: updated.status } : prev)
    }
    setIsSaving(false)
  }

  async function handleDraftReminder() {
    if (!appt?.patients) return
    setIsDraftingReminder(true)

    // Try AI draft; fall back to a static Telugu/English message
    let reminderText: string
    try {
      const res = await fetch('/api/ai/draft-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: params.id, language: appt.patients.preferred_language }),
      })
      if (res.ok) {
        const { text } = await res.json()
        reminderText = text
      } else {
        throw new Error('stub')
      }
    } catch {
      const dateLabel = formatDate(appt.start)
      const timeLabel = formatTime(appt.start)
      reminderText = appt.patients.preferred_language === 'te'
        ? `నమస్కారం ${appt.patients.name} గారు, మీకు VEDA Dental Clinic లో ${dateLabel}, ${timeLabel} కి అపాయింట్‌మెంట్ ఉంది. దయచేసి సమయానికి రండి. ధన్యవాదాలు.`
        : `Hello ${appt.patients.name}, your appointment at VEDA Dental Clinic is on ${dateLabel} at ${timeLabel}. Please arrive on time. Thank you.`
    }

    const phone = appt.patients.phone.replace(/\D/g, '')
    setWaLink(`https://wa.me/91${phone}?text=${encodeURIComponent(reminderText)}`)
    setIsDraftingReminder(false)
  }

  if (isLoading) return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
  if (!appt) return null

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/appointments" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-3.5 w-3.5" />
        Appointments
      </Link>

      {/* Header card */}
      <div className="rounded-lg border border-border bg-background p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {appt.patients?.name ?? 'Unknown Patient'}
            </h2>
            <p className="text-xs text-muted-foreground">{appt.patients?.phone}</p>
          </div>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', STATUS_STYLE[appt.status])}>
            {appt.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
            <p className="text-foreground">{formatDate(appt.start)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Time (IST)</p>
            <p className="text-foreground">{formatTime(appt.start)} – {formatTime(appt.end)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dentist</p>
            <p className="text-foreground">{appt.profiles?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chair</p>
            <p className="text-foreground">Chair {appt.chair_id}</p>
          </div>
        </div>

        {appt.notes && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
            <p className="mt-1 text-sm text-foreground">{appt.notes}</p>
          </div>
        )}

        {appt.patients && (
          <Link
            href={`/patients/${appt.patients.id}`}
            className="inline-block text-xs text-primary hover:underline"
          >
            View patient record →
          </Link>
        )}
      </div>

      {/* Status update */}
      <div className="rounded-lg border border-border bg-background p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                status === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-surface',
              )}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {saveError && (
          <p className="text-xs text-danger">{saveError}</p>
        )}

        <button
          type="button"
          onClick={handleStatusSave}
          disabled={isSaving || status === appt.status}
          className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save Status'}
        </button>
      </div>

      {/* WhatsApp reminder */}
      <div className="rounded-lg border border-border bg-background p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Send Reminder</h3>
        <p className="text-xs text-muted-foreground">
          Draft a WhatsApp reminder in the patient&apos;s preferred language.
        </p>

        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <MessageSquare className="h-4 w-4" />
            Open WhatsApp
          </a>
        ) : (
          <button
            type="button"
            onClick={handleDraftReminder}
            disabled={isDraftingReminder}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4" />
            {isDraftingReminder ? 'Drafting…' : 'Draft WhatsApp Reminder'}
          </button>
        )}
      </div>
    </div>
  )
}
