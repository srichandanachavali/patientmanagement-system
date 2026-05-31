'use client'
// ── F141 · src/app/(app)/patients/new/page.tsx
// Purpose: New patient registration — ConsentCapture + PatientForm → POST /api/patients
// In: POST /api/patients (F060), ConsentCapture (F147), PatientForm (F146) | Out: NewPatientPage | See: F060, F146, F147

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PatientForm, type PatientFormValues } from '@/components/patients/PatientForm'
import { ConsentCapture } from '@/components/patients/ConsentCapture'
import type { ConsentScope } from '@/types'

function splitToArray(s?: string): string[] {
  return s ? s.split(',').map((t) => t.trim()).filter(Boolean) : []
}

export default function NewPatientPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [grantedScopes, setGrantedScopes] = useState<ConsentScope[]>(['CLINICAL'])

  async function handleSubmit(data: PatientFormValues) {
    setIsSubmitting(true)
    setServerError(null)

    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        dob: data.dob || null,
        gender: data.gender || null,
        email: data.email || null,
        address: data.address || null,
        emergency_contact: data.emergency_contact || null,
        abha_number: data.abha_number || null,
        preferred_language: data.preferred_language,
        conditions: splitToArray(data.conditions),
        medications: splitToArray(data.medications),
        allergies: splitToArray(data.allergies),
        notes: data.medical_notes || null,
        consent_scopes: grantedScopes,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setServerError(body.error ?? 'Failed to register patient. Please try again.')
      setIsSubmitting(false)
      return
    }

    const patient = await res.json()
    router.push(`/patients/${patient.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/patients"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Patients
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium text-foreground">New Patient</span>
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground">Register New Patient</h2>
        <p className="text-xs text-muted-foreground">
          All fields marked <span className="text-danger">*</span> are required.
        </p>
      </div>

      <ConsentCapture onChange={setGrantedScopes} />

      {serverError && (
        <div className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">{serverError}</div>
      )}

      <PatientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
