'use client'
// ── F140 · src/app/(app)/patients/page.tsx
// Purpose: Patient list with 300 ms debounced search → GET /api/patients?q=
// In: GET /api/patients (F060), PatientCard (F145) | Out: PatientsPage | See: F060, F141, F145

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, UserPlus } from 'lucide-react'
import { PatientCard } from '@/components/patients/PatientCard'
import type { Patient, MedicalHistory } from '@/types'

type PatientRow = Patient & { medical_histories: Pick<MedicalHistory, 'allergies'>[] | null }

export default function PatientsPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    const url = debouncedQuery
      ? `/api/patients?q=${encodeURIComponent(debouncedQuery)}`
      : '/api/patients'
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setPatients(Array.isArray(data) ? data : []); setIsLoading(false) })
      .catch(() => { setError('Failed to load patients'); setIsLoading(false) })
  }, [debouncedQuery])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Patients</h2>
          {!isLoading && !error && (
            <p className="text-xs text-muted-foreground">{patients.length} total</p>
          )}
        </div>
        <Link
          href="/patients/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <UserPlus className="h-3.5 w-3.5" />
          New Patient
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, or ABHA number…"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        />
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      )}
      {error && (
        <p className="py-8 text-center text-sm text-danger">{error}</p>
      )}
      {!isLoading && !error && patients.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {debouncedQuery ? `No patients found for "${debouncedQuery}"` : 'No patients registered yet.'}
        </p>
      )}
      {!isLoading && !error && patients.length > 0 && (
        <div className="space-y-2">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              hasAllergies={(patient.medical_histories?.[0]?.allergies?.length ?? 0) > 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
