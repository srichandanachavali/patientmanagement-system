// ── F025 · src/types/billing.ts
// Purpose: Invoice, Payment, Prescription, LabCase interfaces + status/mode unions
// In: — | Out: InvoiceStatus, PaymentMode, LabCaseStatus, LabCaseType, AuditAction, Invoice, InvoiceLine, Payment, LabCase, AuditLog | See: F031, F070, F071
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED'
export type PaymentMode = 'CASH' | 'UPI' | 'CARD'
export type LabCaseStatus =
  | 'Planned'
  | 'Impression Taken'
  | 'Sent to Lab'
  | 'Received'
  | 'Fitted/Delivered'
export type LabCaseType =
  | 'Crown/Cap'
  | 'Bridge'
  | 'Denture (Complete)'
  | 'Denture (Partial)'
  | 'Veneer'
  | 'Inlay/Onlay'
  | 'Orthodontic Clip/Retainer'
  | 'Aligner'
  | 'Night Guard'
  | 'Implant Crown'
  | 'Post & Core'
  | 'Other'
export type AuditAction = 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE'

export interface Invoice {
  id: string
  patient_id: string
  issued_at: string
  status: InvoiceStatus
}

export interface InvoiceLine {
  id: string
  invoice_id: string
  procedure_id: string | null
  description: string
  amount: number
  tax_rate: number
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  mode: PaymentMode
  paid_at: string
}

export interface LabCase {
  id: string
  patient_id: string
  patient_name: string
  patient_phone: string
  case_type: LabCaseType
  tooth_numbers: string | null
  material: string | null
  shade: string | null
  lab_name: string | null
  dentist_notes: string | null
  lab_assistant_notes: string | null
  cost: number | null
  status: LabCaseStatus
  sent_at: string | null
  expected_at: string | null
  delivered_at: string | null
  created_by_name: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  actor_id: string
  action: AuditAction
  entity: string
  entity_id: string
  at: string
}
