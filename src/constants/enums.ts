// ── F031 · src/constants/enums.ts
// Purpose: Typed arrays of all enum values — used in dropdowns, validation, and iteration
// In: types (F020–F026), toothConditions (F209) | Out: all status/type arrays | See: F020–F026, F209
import type {
  AppointmentStatus,
  ToothStatus,
  ToothFinding,
  ToothSurface,
  InvoiceStatus,
  PaymentMode,
  LabCaseStatus,
  LabCaseType,
  AuditAction,
  PlanStatus,
  ProcedureStatus,
  AttachmentType,
  UserRole,
  ConsentScope,
} from '@/types'

import { PRIMARY_STATUSES, TOOTH_FINDINGS as _FINDINGS } from '@/constants/toothConditions'

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'BOOKED', 'CONFIRMED', 'ARRIVED', 'IN_CHAIR', 'COMPLETED', 'NO_SHOW', 'CANCELLED',
]

// Derived from toothConditions.ts — single source of truth
export const TOOTH_STATUSES: ToothStatus[] = PRIMARY_STATUSES as ToothStatus[]

export const TOOTH_FINDINGS: ToothFinding[] = _FINDINGS as ToothFinding[]

export const TOOTH_SURFACES: ToothSurface[] = ['M', 'D', 'O', 'B', 'L', 'C']

export const INVOICE_STATUSES: InvoiceStatus[] = [
  'DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'CANCELLED',
]

export const PAYMENT_MODES: PaymentMode[] = ['CASH', 'UPI', 'CARD']

export const LAB_CASE_STATUSES: LabCaseStatus[] = [
  'Planned', 'Impression Taken', 'Sent to Lab', 'Received', 'Fitted/Delivered',
]

export const LAB_CASE_TYPES: LabCaseType[] = [
  'Crown/Cap', 'Bridge', 'Denture (Complete)', 'Denture (Partial)',
  'Veneer', 'Inlay/Onlay', 'Orthodontic Clip/Retainer', 'Aligner',
  'Night Guard', 'Implant Crown', 'Post & Core', 'Other',
]

export const AUDIT_ACTIONS: AuditAction[] = ['VIEW', 'CREATE', 'UPDATE', 'DELETE']

export const PLAN_STATUSES: PlanStatus[] = ['Active', 'Completed', 'Archived']

export const PROCEDURE_STATUSES: ProcedureStatus[] = [
  'Planned', 'In-Progress', 'Completed', 'Cancelled',
]

export const ATTACHMENT_TYPES: AttachmentType[] = ['X-ray', 'Photo', 'Document', 'Lab-report']

export const USER_ROLES: UserRole[] = ['Admin', 'Dentist', 'Assistant', 'Receptionist']

export const CONSENT_SCOPES: ConsentScope[] = ['CLINICAL', 'BILLING', 'REMINDERS']
