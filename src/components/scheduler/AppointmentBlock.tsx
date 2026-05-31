'use client'
// ── F155 · src/components/scheduler/AppointmentBlock.tsx
// Purpose: Appointment card positioned absolutely in the day grid by top/height from IST minutes
// In: id, patientName, dentist, start/end HH:MM, status, dayStartHHMM | Out: AppointmentBlock | See: F153, F023

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'

const HOUR_HEIGHT = 64 // px per hour — matches TimeGrid

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  'BOOKED':    'bg-secondary border-border text-secondary-foreground',
  'CONFIRMED': 'bg-info/15 border-info/40 text-info',
  'ARRIVED':   'bg-warning/15 border-warning/40 text-warning',
  'IN_CHAIR':  'bg-purple-100 border-purple-300 text-purple-800',
  'COMPLETED': 'bg-success/15 border-success/40 text-success',
  'NO_SHOW':   'bg-danger-bg border-danger/30 text-danger',
  'CANCELLED': 'bg-danger-bg/60 border-danger/20 text-danger/70',
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

interface AppointmentBlockProps {
  id: string
  patientName: string
  dentist: string
  start: string  // "HH:MM"
  end: string    // "HH:MM"
  status: AppointmentStatus
  dayStartHHMM: string
}

export function AppointmentBlock({
  id,
  patientName,
  dentist,
  start,
  end,
  status,
  dayStartHHMM,
}: AppointmentBlockProps) {
  const dayStartMin = toMinutes(dayStartHHMM)
  const startMin = toMinutes(start)
  const endMin = toMinutes(end)
  const top = ((startMin - dayStartMin) / 60) * HOUR_HEIGHT
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 20)

  return (
    <Link
      href={`/appointments/${id}`}
      className={cn(
        'absolute inset-x-0.5 overflow-hidden rounded border px-1.5 py-1 text-[11px] hover:brightness-95',
        STATUS_STYLE[status],
      )}
      style={{ top, height }}
    >
      <p className="truncate font-medium leading-tight">{patientName}</p>
      {height >= 32 && (
        <p className="truncate leading-tight opacity-70">{dentist}</p>
      )}
      {height >= 44 && (
        <p className="leading-tight opacity-60">
          {start}–{end}
        </p>
      )}
    </Link>
  )
}
