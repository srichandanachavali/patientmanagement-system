'use client'
// ── F149 · src/components/patients/EditPatientClient.tsx
// Purpose: Client wrapper — form submit → PATCH /api/patients/[id]; splits comma strings back to arrays
// In: patientId, defaultValues (from F143), PatientForm (F146) | Out: EditPatientClient | See: F143, F146, F061

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PatientForm, type PatientFormValues } from '@/components/patients/PatientForm'

function splitToArray(s?: string): string[] {
  return s ? s.split(',').map((t) => t.trim()).filter(Boolean) : []
}

interface EditPatientClientProps {
  patientId: string
  defaultValues: PatientFormValues
}

export function EditPatientClient({ patientId, defaultValues }: EditPatientClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSubmit(data: PatientFormValues) {
    setIsSubmitting(true)
    setServerError(null)

    const res = await fetch(`/api/patients/${patientId}`, {
      method: 'PATCH',
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
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setServerError(body.error ?? 'Failed to save. Please try again.')
      setIsSubmitting(false)
      return
    }

    router.push(`/patients/${patientId}`)
    router.refresh()
  }

  return (
    <>
      {serverError && (
        <div className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">{serverError}</div>
      )}
      <PatientForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
