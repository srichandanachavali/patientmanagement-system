'use client'
// ── F151 · src/app/(app)/appointments/new/page.tsx
// Purpose: New appointment form — patient typeahead search, dentist/chair select, IST time conversion
// In: GET /api/patients (F060), GET /api/profiles, POST /api/appointments | Out: NewAppointmentPage | See: F150, F153

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

interface Dentist { id: string; name: string }

const inputCls = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
const labelCls = 'text-xs font-medium text-foreground'

function toISOFromIST(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00+05:30`).toISOString()
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const params = useSearchParams()

  const [dentists, setDentists] = useState<Dentist[]>([])
  const [patientQuery, setPatientQuery] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const [dentistId, setDentistId] = useState('')
  const [chairId, setChairId] = useState('1')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('10:00')
  const [durationMins, setDurationMins] = useState('30')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load dentists once
  useEffect(() => {
    fetch('/api/profiles?role=Dentist')
      .then((r) => r.json())
      .then((d) => {
        setDentists(Array.isArray(d) ? d : [])
        if (Array.isArray(d) && d.length > 0) setDentistId(d[0].id)
      })
      .catch(() => {})
  }, [])

  // Pre-fill patient from ?patient= query param
  useEffect(() => {
    const pid = params.get('patient')
    if (!pid) return
    fetch(`/api/patients/${pid}`)
      .then((r) => r.json())
      .then((d) => { if (d?.id) setSelectedPatient(d) })
      .catch(() => {})
  }, [params])

  // Patient search debounce
  useEffect(() => {
    if (!patientQuery.trim() || selectedPatient) {
      setPatientResults([])
      return
    }
    const id = setTimeout(() => {
      fetch(`/api/patients?q=${encodeURIComponent(patientQuery)}`)
        .then((r) => r.json())
        .then((d) => setPatientResults(Array.isArray(d) ? d.slice(0, 6) : []))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(id)
  }, [patientQuery, selectedPatient])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPatient) { setError('Please select a patient'); return }
    if (!dentistId) { setError('Please select a dentist'); return }
    setIsSubmitting(true)
    setError(null)

    const start = toISOFromIST(date, startTime)
    const endMs = new Date(start).getTime() + Number(durationMins) * 60 * 1000
    const end = new Date(endMs).toISOString()

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: selectedPatient.id,
        dentist_id: dentistId,
        chair_id: Number(chairId),
        start,
        end,
        notes: notes.trim() || null,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to book appointment')
      setIsSubmitting(false)
      return
    }

    const appt = await res.json()
    router.push(`/appointments/${appt.id}`)
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/appointments" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-3.5 w-3.5" />
          Appointments
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium text-foreground">New Appointment</span>
      </div>

      <h2 className="text-base font-semibold text-foreground">Book Appointment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Patient <span className="text-danger">*</span></label>
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-md border border-input bg-surface px-3 py-2 text-sm">
              <span>{selectedPatient.name} · {selectedPatient.phone}</span>
              <button type="button" onClick={() => { setSelectedPatient(null); setPatientQuery('') }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Search patient by name or phone…"
                className={inputCls}
              />
              {patientResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md">
                  {patientResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSelectedPatient(p); setPatientQuery(''); setPatientResults([]) }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dentist */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Dentist <span className="text-danger">*</span></label>
          <select value={dentistId} onChange={(e) => setDentistId(e.target.value)} className={inputCls}>
            {dentists.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Chair + Date in a row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Chair <span className="text-danger">*</span></label>
            <select value={chairId} onChange={(e) => setChairId(e.target.value)} className={inputCls}>
              <option value="1">Chair 1</option>
              <option value="2">Chair 2</option>
              <option value="3">Chair 3</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Date <span className="text-danger">*</span></label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
          </div>
        </div>

        {/* Start time + duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Start time (IST) <span className="text-danger">*</span></label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} step="900" required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Duration <span className="text-danger">*</span></label>
            <select value={durationMins} onChange={(e) => setDurationMins(e.target.value)} className={inputCls}>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
              <option value="120">2 hr</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Procedure details, patient notes…"
            className={cn(inputCls, 'resize-none')}
          />
        </div>

        {error && (
          <div className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Booking…' : 'Book Appointment'}
          </button>
          <Link
            href="/appointments"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
