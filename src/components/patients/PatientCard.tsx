// ── F145 · src/components/patients/PatientCard.tsx
// Purpose: Patient list card — allergy badge, language tag, age; reads snake_case API shape
// In: Patient (F022), hasAllergies boolean | Out: PatientCard | See: F140, F022, F012
import Link from 'next/link'
import { Phone, Calendar, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Patient } from '@/types'

interface PatientCardProps {
  patient: Patient
  lastVisit?: string | null
  hasAllergies?: boolean
}

const LANG_LABEL = { te: 'తెలుగు', en: 'English' }

export function PatientCard({ patient, lastVisit, hasAllergies }: PatientCardProps) {
  const age = patient.dob
    ? Math.floor((Date.now() - new Date(patient.dob).getTime()) / 31_557_600_000)
    : null

  return (
    <Link
      href={`/patients/${patient.id}`}
      className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-surface"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{patient.name}</p>
          {hasAllergies && (
            <span className="shrink-0 rounded-full bg-danger-bg px-1.5 py-0.5 text-[10px] font-semibold text-danger">
              Allergies
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {patient.phone}
          </span>
          {age !== null && (
            <span className="text-xs text-muted-foreground">{age} yrs</span>
          )}
          {patient.gender && (
            <span className="text-xs text-muted-foreground">{patient.gender}</span>
          )}
        </div>
        {lastVisit && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Last visit: {lastVisit}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-medium',
            patient.preferred_language === 'te'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-blue-50 text-blue-700',
          )}
        >
          {LANG_LABEL[patient.preferred_language]}
        </span>
        {patient.abha_number && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            ABHA
          </span>
        )}
      </div>
    </Link>
  )
}
