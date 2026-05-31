<!-- F909 · docs/API.md · API route signatures + request/response shapes for all routes -->

# VEDA Dental PMS — API Route Reference

All routes live under `src/app/api/`.
Auth: All routes require a valid Supabase session cookie unless marked PUBLIC.
Errors follow the shape: `{ error: string, code?: string }`.

---

## Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/login | PUBLIC | Supabase email + password sign-in; sets session cookie |
| POST | /api/auth/logout | Required | Clears session cookie |

---

## Patients

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/patients | Required | List patients; query params: `?q=` (name/phone/ABHA search), `?limit=`, `?offset=` |
| POST | /api/patients | Required (Receptionist+) | Create new patient with consent record; returns created patient id |
| GET | /api/patients/[id] | Required | Fetch single patient with MedicalHistory and Consent records |
| PATCH | /api/patients/[id] | Required (Receptionist+) | Partial update of patient fields |
| DELETE | /api/patients/[id] | Required (Admin only) | Soft delete / erasure per DPDP patient rights; sets withdrawn_at on Consent |

---

## Appointments

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/appointments | Required | List appointments; query params: `?date=`, `?dentist_id=`, `?chair_id=` |
| POST | /api/appointments | Required (Receptionist+) | Create appointment; validates no chair conflict; validates against ClinicSettings hours |
| PATCH | /api/appointments/[id] | Required | Update status or notes |
| DELETE | /api/appointments/[id] | Required (Admin+) | Cancel appointment |

---

## Odontogram

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/odontogram/[patientId] | Required | Fetch all ToothRecord rows for a patient |
| PUT | /api/odontogram/[patientId]/[toothFdi] | Required (Dentist+) | Upsert tooth status and surface annotation |

---

## Billing

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/invoices | Required | List invoices; query params: `?patient_id=`, `?status=` |
| POST | /api/invoices | Required (Receptionist+) | Create invoice with line items |
| GET | /api/invoices/[id] | Required | Fetch invoice with lines and payments |
| POST | /api/invoices/[id]/payments | Required (Receptionist+) | Record a payment (full or partial); updates invoice status |
| GET | /api/invoices/[id]/pdf | Required | Returns invoice data for client-side PDF render |

---

## Clinical

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/notes | Required (Dentist+) | Create clinical note for an appointment |
| GET | /api/notes/[patientId] | Required (Dentist+) | List all clinical notes for a patient in reverse chronological order |
| POST | /api/treatment-plans | Required (Dentist+) | Create treatment plan with procedures |
| PATCH | /api/treatment-plans/[id] | Required (Dentist+) | Update plan status or add/update procedures |

---

## Prescriptions

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/prescriptions | Required (Dentist only) | Create prescription with drug items array |
| GET | /api/prescriptions/[patientId] | Required (Dentist+) | List all prescriptions for a patient |

---

## Attachments

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/attachments | Required (Dentist+) | Upload file to Supabase Storage; returns attachment id (NOT raw URL) |
| GET | /api/attachments/[id] | Required | Returns a fresh signed URL (1-hour expiry) for the attachment |

---

## AI

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/ai/summarize-note | Required (Dentist+) | Body: `{ note_id }` → returns AI summary of clinical note via Anthropic API |
| POST | /api/ai/draft-reminder | Required (Receptionist+) | Body: `{ appointment_id, language: "te" \| "en" }` → returns draft reminder text |
| POST | /api/ai/recall-priority | Required (Admin+) | Body: `{ patient_ids: string[] }` → returns prioritized recall list with rationale |

---

## Recalls

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/recalls | Required (Admin+) | List patients due for recall; query params: `?days_overdue=` |

---

## Lab Cases

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/lab | Required | List lab cases; query params: `?status=`, `?patient_id=` |
| POST | /api/lab | Required (Dentist+) | Create lab case |
| PATCH | /api/lab/[id] | Required (Dentist+) | Update lab case status or expected return date |

---

## Email

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/email/send | Required (Admin+) | Send transactional email via Resend (fallback: Brevo) |

---

## Settings

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/settings | Required | Fetch ClinicSettings row (clinic name, hours, GST rates, branding) |
| PATCH | /api/settings | Required (Admin only) | Update clinic name, hours, GST rates, or branding |

---

## Audit Log

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/audit-log | Required (Admin only) | List AuditLog entries; query params: `?entity=`, `?actor_id=`, `?from=`, `?to=` |
