// ── F022 · src/types/patient.ts
// Purpose: Patient, MedicalHistory, Consent interfaces + Language/ConsentScope unions
// In: — | Out: Language, ConsentScope, Patient, MedicalHistory, Consent | See: F060, F061, F147
export type Language = 'te' | 'en'
export type ConsentScope = 'CLINICAL' | 'BILLING' | 'REMINDERS'

export interface Patient {
  id: string
  name: string
  dob: string | null
  gender: string | null
  phone: string
  email: string | null
  address: string | null
  emergency_contact: string | null
  abha_number: string | null
  preferred_language: Language
  created_at: string
  // included in list API response for allergy badge
  medical_histories?: { allergies: string[] }[] | null
}

export interface MedicalHistory {
  id: string
  patient_id: string
  conditions: string[]
  medications: string[]
  allergies: string[]
  notes: string | null
}

export interface Consent {
  id: string
  patient_id: string
  scope: ConsentScope
  granted_at: string
  withdrawn_at: string | null
}
