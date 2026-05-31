'use client'
// ── F153 · src/components/scheduler/DayView.tsx
// Purpose: Day/chair grid — day navigation, fetches /api/appointments?date=, per-chair columns; Sunday shorter hours
// In: TimeGrid/SlotLines (F154), AppointmentBlock (F155), CHAIR_IDS (F030) | Out: DayView | See: F150, F154, F155

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react'
import Link from 'next/link'
import { format, addDays, subDays, isToday, isSunday } from 'date-fns'
import { TimeGrid, SlotLines } from './TimeGrid'
import { AppointmentBlock } from './AppointmentBlock'
import { CHAIR_IDS } from '@/constants/clinic'
import type { AppointmentStatus } from '@/types'

const HOUR_HEIGHT = 64
const WEEKDAY_HOURS = { start: '09:30', end: '21:00' }
const SUNDAY_HOURS  = { start: '09:30', end: '13:00' }

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function isoToISTHHMM(iso: string): string {
  const ms = new Date(iso).getTime() + 5.5 * 60 * 60 * 1000
  const d = new Date(ms)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

interface ApptRow {
  id: string
  chair_id: number
  start: string
  end: string
  status: AppointmentStatus
  patients: { name: string } | null
  profiles: { name: string } | null
}

export function DayView() {
  const [date, setDate] = useState<Date>(() => new Date())
  const [appointments, setAppointments] = useState<ApptRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const sunday = isSunday(date)
  const hours = sunday ? SUNDAY_HOURS : WEEKDAY_HOURS
  const gridHeight = ((toMinutes(hours.end) - toMinutes(hours.start)) / 60) * HOUR_HEIGHT

  useEffect(() => {
    setIsLoading(true)
    const dateStr = format(date, 'yyyy-MM-dd')
    fetch(`/api/appointments?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => { setAppointments(Array.isArray(data) ? data : []); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [date])

  return (
    <div className="flex flex-col gap-4">
      {/* Nav bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDate((d) => subDays(d, 1))}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-surface"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDate(new Date())}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDate((d) => addDays(d, 1))}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-surface"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-2 text-sm font-semibold text-foreground">
            {format(date, 'EEEE, d MMMM yyyy')}
            {isToday(date) && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">(Today)</span>
            )}
          </span>
        </div>

        <Link
          href="/appointments/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          New Appointment
        </Link>
      </div>

      {isLoading && (
        <p className="py-4 text-center text-xs text-muted-foreground">Loading…</p>
      )}

      {/* Grid */}
      <div className="overflow-auto rounded-lg border border-border bg-background">
        {/* Sticky chair header */}
        <div className="sticky top-0 z-10 flex border-b border-border bg-surface">
          <div className="w-14 shrink-0 border-r border-border" />
          {CHAIR_IDS.map((chairId) => {
            const count = appointments.filter((a) => a.chair_id === chairId).length
            return (
              <div
                key={chairId}
                className="flex-1 border-r border-border px-3 py-2.5 last:border-r-0"
              >
                <p className="text-xs font-semibold text-foreground">Chair {chairId}</p>
                <p className="text-[10px] text-muted-foreground">{count} appointment{count !== 1 ? 's' : ''}</p>
              </div>
            )
          })}
        </div>

        {/* Scrollable time body */}
        <div className="flex" style={{ height: gridHeight }}>
          <TimeGrid dayStart={hours.start} dayEnd={hours.end} />

          {CHAIR_IDS.map((chairId, i) => (
            <div
              key={chairId}
              className={`relative flex-1 ${i < CHAIR_IDS.length - 1 ? 'border-r border-border' : ''}`}
              style={{ height: gridHeight }}
            >
              <SlotLines dayStart={hours.start} dayEnd={hours.end} />
              {appointments
                .filter((a) => a.chair_id === chairId)
                .map((appt) => (
                  <AppointmentBlock
                    key={appt.id}
                    id={appt.id}
                    patientName={appt.patients?.name ?? 'Unknown'}
                    dentist={appt.profiles?.name ?? '—'}
                    start={isoToISTHHMM(appt.start)}
                    end={isoToISTHHMM(appt.end)}
                    status={appt.status}
                    dayStartHHMM={hours.start}
                  />
                ))}
            </div>
          ))}
        </div>

        {sunday && (
          <div className="border-t border-border px-4 py-2 text-center text-[11px] text-muted-foreground">
            Sunday hours: 9:30 AM – 1:00 PM
          </div>
        )}
      </div>
    </div>
  )
}
