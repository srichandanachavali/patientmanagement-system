// ── F024 · src/types/clinical.ts
// Purpose: Odontogram + treatment plan + clinical note + attachment types
// In: — | Out: ToothStatus, ToothSurface, ToothRecord, PlanStatus, ProcedureStatus, TreatmentPlan, Procedure, ClinicalNote, AttachmentType, Attachment | See: F031, F032, F160
export type ToothStatus = 'HEALTHY' | 'CARIES' | 'FILLED' | 'MISSING' | 'CROWN' | 'RCT' | 'IMPLANT'
export type ToothSurface = 'M' | 'D' | 'O' | 'B' | 'L'

export interface ToothRecord {
  id: string
  patient_id: string
  tooth_fdi: number
  status: ToothStatus
  surface: ToothSurface | null
  updated_at: string
}

export type PlanStatus = 'Active' | 'Completed' | 'Archived'
export type ProcedureStatus = 'Planned' | 'In-Progress' | 'Completed' | 'Cancelled'

export interface TreatmentPlan {
  id: string
  patient_id: string
  created_by: string
  status: PlanStatus
}

export interface Procedure {
  id: string
  plan_id: string
  tooth_fdi: number | null
  code: string
  description: string
  cost_estimate: number
  status: ProcedureStatus
  performed_at: string | null
}

export interface ClinicalNote {
  id: string
  patient_id: string
  appointment_id: string
  author_id: string
  body: string
  created_at: string
}

export type AttachmentType = 'X-ray' | 'Photo' | 'Document' | 'Lab-report'

export interface Attachment {
  id: string
  patient_id: string
  type: AttachmentType
  storage_url: string
  uploaded_by: string
  created_at: string
}
