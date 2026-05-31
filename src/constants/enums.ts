// ── F031 · src/constants/enums.ts
// Purpose: Typed arrays of all enum values — used in dropdowns, validation, and iteration
// In: all status/mode/role types (F020–F026) | Out: APPOINTMENT_STATUSES, TOOTH_STATUSES, TOOTH_SURFACES, INVOICE_STATUSES, PAYMENT_MODES, LAB_CASE_STATUSES, LAB_CASE_TYPES, AUDIT_ACTIONS, PLAN_STATUSES, PROCEDURE_STATUSES, ATTACHMENT_TYPES, USER_ROLES, CONSENT_SCOPES | See: F020–F026
import type {
  AppointmentStatus,
  ToothStatus,
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

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'BOOKED', 'CONFIRMED', 'ARRIVED', 'IN_CHAIR', 'COMPLETED', 'NO_SHOW', 'CANCELLED',
]

export const TOOTH_STATUSES: ToothStatus[] = [
  'HEALTHY', 'CARIES', 'FILLED', 'MISSING', 'CROWN', 'RCT', 'IMPLANT',
]

export const TOOTH_SURFACES: ToothSurface[] = ['M', 'D', 'O', 'B', 'L']

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
