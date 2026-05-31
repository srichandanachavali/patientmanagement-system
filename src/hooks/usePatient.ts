'use client'
// ── F040 · src/hooks/usePatient.ts
// Purpose: Client hook — fetches /api/patients/:id, returns PatientDetail with histories + consents
// In: patient id string | Out: { data: PatientDetail | null, isLoading, error } | See: F022, F061

import { useState, useEffect } from 'react'
import type { Patient, MedicalHistory, Consent } from '@/types'

export type PatientDetail = Patient & {
  medical_histories: MedicalHistory[]
  consents: Consent[]
}

export function usePatient(id: string | null) {
  const [data, setData] = useState<PatientDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setError(null)

    fetch(`/api/patients/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then((d) => { setData(d); setIsLoading(false) })
      .catch((e: Error) => { setError(e.message); setIsLoading(false) })
  }, [id])

  return { data, isLoading, error }
}
