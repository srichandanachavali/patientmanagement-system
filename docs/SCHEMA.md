<!-- F905 · docs/SCHEMA.md · DB field reference for all 17 Prisma models -->

# VEDA Dental PMS — Database Schema Reference

All tables live in the Supabase Postgres database.
Row Level Security (RLS) is enabled on all tables.
`id` fields are UUID unless otherwise noted.

## CORE TypeScript Contracts

These are the canonical types. Every layer must import from `src/types/` — never redefine inline.
Phase C2 implements these into `src/types/*.ts`. Do not modify without updating both places.

```typescript
// src/types/user.ts
export type UserRole = 'Admin' | 'Dentist' | 'Assistant' | 'Receptionist'
export interface User { id: string; name: string; role: UserRole }

// src/types/settings.ts
export type ClinicHours = { mon:string; tue:string; wed:string; thu:string; fri:string; sat:string; sun:string }
export interface ClinicSettings {
  id: string; name: string
  hours_json: ClinicHours
  gst_rates_json: { default: number; exempted: number }
  branding_json: { logo_url: string; accent_color: string }
}

// src/types/patient.ts
export type Language = 'te' | 'en'
export type ConsentScope = 'clinical' | 'billing' | 'reminders'
export interface Patient {
  id: string; name: string; dob: string | null; gender: string | null
  phone: string; email: string | null; address: string | null
  emergency_contact: string | null; abha_number: string | null
  preferred_language: Language; created_at: string
}
export interface MedicalHistory {
  id: string; patient_id: string
  conditions: string[]; medications: string[]; allergies: string[]; notes: string | null
}
export interface Consent {
  id: string; patient_id: string; notice_version: string
  scope: ConsentScope; granted_at: string; withdrawn_at: string | null
}

// src/types/appointment.ts
export type AppointmentStatus = 'Scheduled'|'Confirmed'|'Arrived'|'In-Chair'|'Completed'|'No-Show'|'Cancelled'
export interface Appointment {
  id: string; patient_id: string; dentist_id: string; chair_id: number
  start: string; end: string; status: AppointmentStatus; notes: string | null
}

// src/types/clinical.ts
export type ToothStatus = 'Healthy'|'Caries'|'Missing'|'Restored'|'Crowned'|'Extracted'|'Other'
export type ToothSurface = 'M'|'D'|'O'|'B'|'L'
export interface ToothRecord {
  id: string; patient_id: string; tooth_fdi: number
  status: ToothStatus; surface: ToothSurface | null; updated_at: string
}
export type PlanStatus = 'Active'|'Completed'|'Archived'
export type ProcedureStatus = 'Planned'|'In-Progress'|'Completed'|'Cancelled'
export interface TreatmentPlan { id: string; patient_id: string; created_by: string; status: PlanStatus }
export interface Procedure {
  id: string; plan_id: string; tooth_fdi: number | null; code: string
  description: string; cost_estimate: number; status: ProcedureStatus; performed_at: string | null
}
export interface ClinicalNote {
  id: string; patient_id: string; appointment_id: string
  author_id: string; body: string; created_at: string
}
export type AttachmentType = 'X-ray'|'Photo'|'Document'|'Lab-report'
export interface Attachment {
  id: string; patient_id: string; type: AttachmentType
  storage_url: string; uploaded_by: string; created_at: string
}

// src/types/billing.ts
export type InvoiceStatus = 'Draft'|'Sent'|'Paid'|'Partially Paid'|'Cancelled'
export type PaymentMode = 'Cash'|'UPI'|'Card'|'Insurance'
export type LabCaseStatus = 'Sent'|'In-Lab'|'Received'|'Fitted'
export type LabCaseType = 'Crown'|'Denture'|'Implant'|'Aligner'|'Other'
export type AuditAction = 'VIEW'|'CREATE'|'UPDATE'|'DELETE'
export interface Invoice { id: string; patient_id: string; issued_at: string; status: InvoiceStatus }
export interface InvoiceLine {
  id: string; invoice_id: string; procedure_id: string | null
  description: string; amount: number; tax_rate: number
}
export interface Payment { id: string; invoice_id: string; amount: number; mode: PaymentMode; paid_at: string }
export type PrescriptionItem = { drug: string; dosage: string; frequency: string; duration: string }
export interface Prescription {
  id: string; patient_id: string; appointment_id: string
  items: PrescriptionItem[]; created_by: string; created_at: string
}
export interface LabCase {
  id: string; patient_id: string; type: LabCaseType
  sent_at: string; expected_back: string; status: LabCaseStatus
}
export interface AuditLog {
  id: string; actor_id: string; action: AuditAction
  entity: string; entity_id: string; at: string
}
```

---

## Relationships Summary
- **Patient** is the root entity; all clinical, billing, and scheduling records reference patient_id.
- Appointment links Patient + User (dentist) + chair_id.
- TreatmentPlan → Procedure (one-to-many).
- Invoice → InvoiceLine → Procedure (optional foreign key).
- Invoice → Payment (one-to-many for partial payments).
- AuditLog references any entity via `entity` (table name) + `entity_id` (polymorphic).
- ClinicSettings stores VEDA's real hours in hours_json (including Sunday 9:30am–1pm cutoff).

---

## Patient

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | All tables referencing a patient |
| name | text, NOT NULL | Patient list, appointment scheduler, PDF headers |
| dob | date | Age calculation, pediatric odontogram trigger (under 12 → primary teeth) |
| gender | text | Patient record display |
| phone | text, NOT NULL | wa.me reminder links, patient search |
| email | text | Email reminders via Resend |
| address | text | Invoice PDF, DPDP compliance |
| emergency_contact | text | Patient record display |
| abha_number | text, nullable | ABHA search, future government integration |
| preferred_language | text | Bilingual reminder selection: "te" (Telugu) or "en" (English) |
| created_at | timestamptz | Audit, recall engine baseline date |

---

## MedicalHistory

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| patient_id | uuid, FK → Patient | Patient record page |
| conditions | text[] | Clinical display, allergy banner logic |
| medications | text[] | Clinical display |
| allergies | text[] | Unmissable red allergy banner at top of patient record |
| notes | text | General medical notes visible to dentist |

---

## Consent

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| patient_id | uuid, FK → Patient | Registration flow, DPDP compliance audit |
| notice_version | text | Tracks which version of the consent notice was accepted |
| scope | text | What data the patient consented to: clinical / billing / reminders |
| granted_at | timestamptz | DPDP compliance timestamp |
| withdrawn_at | timestamptz, nullable | Patient erasure / withdrawal workflow trigger |

---

## ToothRecord

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| patient_id | uuid, FK → Patient | Odontogram |
| tooth_fdi | smallint | FDI notation: 11–48 (adult), 51–85 (primary/pediatric) |
| status | text | Odontogram color coding: Healthy / Caries / Missing / Restored / Crowned / Extracted / Other |
| surface | text, nullable | Surface annotation: M (Mesial) / D (Distal) / O (Occlusal) / B (Buccal) / L (Lingual) |
| updated_at | timestamptz | "Last updated" display on odontogram |

---

## Appointment

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | Scheduler, clinical notes, billing |
| patient_id | uuid, FK → Patient | Scheduler display, wa.me reminder |
| dentist_id | uuid, FK → User | Scheduler filter, clinical record ownership |
| chair_id | smallint | Conflict detection: same chair + overlapping time = blocked |
| start | timestamptz | Scheduler day view block start, reminder trigger |
| end | timestamptz | Scheduler block end / duration |
| status | text | Scheduled / Confirmed / Arrived / In-Chair / Completed / No-Show / Cancelled |
| notes | text | Receptionist booking notes |

---

## TreatmentPlan

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | Treatment plan page, procedure list |
| patient_id | uuid, FK → Patient | Patient record, billing link |
| created_by | uuid, FK → User | Ownership and authorship display |
| status | text | Active / Completed / Archived |

---

## Procedure

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | Treatment plan, invoice line item link |
| plan_id | uuid, FK → TreatmentPlan | Treatment plan display |
| tooth_fdi | smallint, nullable | Links procedure to a specific tooth on the odontogram |
| code | text | Dental procedure code — <!-- TBD: ICD-10 / ADA CDT / custom clinic codes --> |
| description | text | Invoice line item description, treatment plan display |
| cost_estimate | numeric(10,2) | Treatment plan cost summary for patient |
| status | text | Planned / In-Progress / Completed / Cancelled |
| performed_at | timestamptz, nullable | Completion timestamp; triggers recall auto-schedule |

---

## ClinicalNote

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| patient_id | uuid, FK → Patient | Patient record clinical tab |
| appointment_id | uuid, FK → Appointment | Ties note to the visit |
| author_id | uuid, FK → User | Note authorship display |
| body | text | Note content; also the input for AI summary via Anthropic API |
| created_at | timestamptz | Note timeline sort key |

---

## Attachment

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| patient_id | uuid, FK → Patient | Patient record attachments tab |
| type | text | X-ray / Photo / Document / Lab-report |
| storage_url | text | Supabase Storage internal path — never returned raw; signed URL generated server-side |
| uploaded_by | uuid, FK → User | Attachment audit trail |
| created_at | timestamptz | Attachment timeline |

---

## Invoice

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | Billing page, PDF receipt |
| patient_id | uuid, FK → Patient | Billing view, receivables |
| issued_at | timestamptz | Invoice date shown on PDF |
| status | text | Draft / Sent / Paid / Partially Paid / Cancelled |

---

## InvoiceLine

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| invoice_id | uuid, FK → Invoice | Invoice PDF line items |
| procedure_id | uuid, FK → Procedure, nullable | Links billed item to clinical procedure record |
| description | text | Line item label on PDF |
| amount | numeric(10,2) | Line item subtotal before tax |
| tax_rate | numeric(5,2) | GST rate applied to this line (default from ENV GST_DEFAULT_RATE) |

---

## Payment

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| invoice_id | uuid, FK → Invoice | Receivables view, partial payment tracking |
| amount | numeric(10,2) | Amount received in this transaction |
| mode | text | Cash / UPI / Card / Insurance |
| paid_at | timestamptz | Payment date on receipt |

---

## Prescription

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| patient_id | uuid, FK → Patient | Patient record |
| appointment_id | uuid, FK → Appointment | Linked visit |
| items | jsonb | Array of `{ drug, dosage, frequency, duration }` objects |
| created_by | uuid, FK → User | Prescribing dentist |
| created_at | timestamptz | Prescription date shown on printed prescription |

---

## LabCase

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| patient_id | uuid, FK → Patient | Lab case tracking view |
| type | text | Crown / Denture / Implant / Aligner / Other |
| sent_at | timestamptz | Date dispatched to lab |
| expected_back | date | Expected return date used for scheduling chairtime |
| status | text | Sent / In-Lab / Received / Fitted |

---

## User

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK (matches Supabase Auth user id) | All FK references to dentist, author, actor |
| name | text | Display name in UI, PDF author field, audit log |
| role | text | Admin / Dentist / Assistant / Receptionist |
| <!-- TBD: email, phone, schedule_json --> | <!-- TBD --> | <!-- TBD: per-dentist working hours for scheduler --> |

---

## AuditLog

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| actor_id | uuid, FK → User | Who performed the action |
| action | text | VIEW / CREATE / UPDATE / DELETE |
| entity | text | Table name e.g. Patient, Invoice, Attachment |
| entity_id | uuid | ID of the affected row |
| at | timestamptz | When the action occurred |

No UPDATE or DELETE is ever permitted on AuditLog rows. INSERT is restricted to service_role only via RLS.

---

## ClinicSettings

| Field | Type | Used In |
|-------|------|---------|
| id | uuid, PK | — |
| name | text | PDF headers, email subjects, browser title — set to "VEDA Super Speciality Dental Clinic" |
| hours_json | jsonb | `{ "mon": "09:30-21:00", "tue": "09:30-21:00", ..., "sun": "09:30-13:00" }` — Sunday cutoff at 1pm pre-loaded |
| gst_rates_json | jsonb | `{ "default": 18, "exempted": 0 }` — confirm with clinic accountant |
| branding_json | jsonb | `{ "logo_url": "...", "accent_color": "<!-- TBD -->" }` |
