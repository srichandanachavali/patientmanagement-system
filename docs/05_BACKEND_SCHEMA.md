# Backend Schema — Data Model & Auth Architecture

## Database Tables (17 Prisma Models)

### Patient
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| name | text NOT NULL | Full name |
| dob | date | Date of birth; used for pediatric odontogram trigger (under 12 → primary teeth) |
| gender | text | |
| phone | text NOT NULL | For wa.me reminder links and patient search |
| email | text | For email reminders |
| address | text | For invoice PDF and DPDP compliance |
| emergency_contact | text | |
| abha_number | text, nullable | ABHA health number for future govt integration |
| preferred_language | text | `te` (Telugu) or `en` (English) for bilingual reminders |
| created_at | timestamptz | Recall engine baseline |

### MedicalHistory
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| conditions | text[] | Diagnosed conditions |
| medications | text[] | Current medications |
| allergies | text[] | Triggers allergy banner on patient record |
| notes | text | General medical notes |

### Consent
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| notice_version | text | DPDP notice version accepted |
| scope | text | `clinical` / `billing` / `reminders` (UPPERCASE in TypeScript: `ConsentScope`) |
| granted_at | timestamptz | DPDP compliance timestamp |
| withdrawn_at | timestamptz, nullable | Patient erasure/withdrawal trigger |

### Appointment
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| dentist_id | uuid FK → User | |
| chair_id | smallint | Conflict detection: same chair + overlapping time = 409 |
| start | timestamptz | Block start |
| end | timestamptz | Block end |
| status | text | Scheduled/Confirmed/Arrived/In-Chair/Completed/No-Show/Cancelled |
| notes | text | Receptionist booking notes |

### ToothRecord
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| tooth_fdi | smallint | FDI notation: 11–48 adult, 51–85 pediatric |
| status | text | Healthy/Caries/Missing/Restored/Crowned/Extracted/Other |
| surface | text, nullable | M/D/O/B/L |
| updated_at | timestamptz | |

### TreatmentPlan
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| created_by | uuid FK → User | |
| status | text | Active/Completed/Archived |

### Procedure
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| plan_id | uuid FK → TreatmentPlan | |
| tooth_fdi | smallint, nullable | Links to specific tooth |
| code | text | Dental procedure code |
| description | text | Line item text on invoice |
| cost_estimate | numeric(10,2) | |
| status | text | Planned/In-Progress/Completed/Cancelled |
| performed_at | timestamptz, nullable | Triggers recall auto-schedule on completion |

### ClinicalNote
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| appointment_id | uuid FK → Appointment | |
| author_id | uuid FK → User | |
| body | text | Note content |
| created_at | timestamptz | |

### Attachment
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| type | text | X-ray/Photo/Document/Lab-report |
| storage_url | text | `public/uploads/<patientId>/` path (never raw in API response) |
| uploaded_by | uuid FK → User | |
| created_at | timestamptz | |

### Invoice
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| issued_at | timestamptz | |
| status | text | Draft/Sent/Paid/Partially Paid/Cancelled |

### InvoiceLine
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| invoice_id | uuid FK → Invoice | |
| procedure_id | uuid FK → Procedure, nullable | |
| description | text | |
| amount | numeric(10,2) | Before tax |
| tax_rate | numeric(5,2) | GST rate (default from `GST_DEFAULT_RATE` env var) |

### Payment
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| invoice_id | uuid FK → Invoice | |
| amount | numeric(10,2) | |
| mode | text | Cash/UPI/Card/Insurance |
| paid_at | timestamptz | |

### Prescription
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| appointment_id | uuid FK → Appointment | |
| items | jsonb | Array of `{ drug, dosage, frequency, duration }` |
| created_by | uuid FK → User | |
| created_at | timestamptz | |

### LabCase
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| patient_id | uuid FK → Patient | |
| type | text | Crown/Denture/Implant/Aligner/Other |
| sent_at | timestamptz | |
| expected_back | date | |
| status | text | Sent/In-Lab/Received/Fitted |

### User
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | Matches iron-session user id |
| name | text | Display name |
| role | text | Admin/Dentist/Assistant/Receptionist |

### AuditLog
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | |
| actor_id | uuid FK → User | |
| action | text | VIEW/CREATE/UPDATE/DELETE |
| entity | text | Table name (polymorphic) |
| entity_id | uuid | Affected row ID |
| at | timestamptz | |

No UPDATE or DELETE permitted on AuditLog rows. INSERT restricted to service_role.

### ClinicSettings (singleton — id=1)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid PK | Always a single row |
| name | text | "VEDA Super Speciality Dental Clinic" |
| hours_json | jsonb | Per-day hours; Sunday cutoff at 1pm pre-loaded |
| gst_rates_json | jsonb | `{ default: 18, exempted: 0 }` |
| branding_json | jsonb | `{ logo_url, accent_color }` |

## Relationships
- Patient is root entity; all clinical, billing, scheduling records reference `patient_id`
- Appointment links Patient + User (dentist) + chair_id
- TreatmentPlan → Procedure (one-to-many)
- Invoice → InvoiceLine → Procedure (optional FK)
- Invoice → Payment (one-to-many partial payments)
- AuditLog: polymorphic via `entity` (table name) + `entity_id`

## Auth Provider
Custom iron-session with bcrypt. No third-party OAuth.
- `POST /api/auth/login` — bcrypt.compare → iron-session `veda_session` cookie + `veda_role` cookie
- `POST /api/auth/logout` — `session.destroy()` + clear cookies

## Row Level Security
Enforced at API route level via `requireSession()`. AuditLog INSERT restricted to service_role. Middleware gates all app routes by session presence and role.

## User Roles
- **Admin** — full access to all features including audit log and clinic settings
- **Dentist** — clinical features: notes, treatment plans, prescriptions, odontogram
- **Assistant** — supports clinical workflow
- **Receptionist** — patient registration, scheduling, billing, recalls

## Sensitive Fields
- `User.password` — bcrypt hash; never returned in API responses
- `SESSION_PASSWORD` — iron-session encryption secret (32+ chars); env var only
- `Attachment.storage_url` — never returned raw; signed URL generated server-side
- `Patient.email` + `Patient.phone` — PII under DPDP Act; access logged

## File Storage
Patient attachments stored to `public/uploads/<patientId>/` (local filesystem, max 10MB per file). No cloud storage in current implementation. Future: Supabase Storage or S3.

## API Endpoints
- `POST/GET /api/auth/login` + `POST /api/auth/logout`
- `GET/POST /api/patients` — search + create with MH + consents
- `GET/PATCH/DELETE /api/patients/[id]` — detail, update, DPDP soft-erase
- `GET/POST /api/patients/[id]/attachments`
- `GET/POST /api/patients/[id]/checklist`
- `GET/POST /api/appointments` + `GET/PATCH/DELETE /api/appointments/[id]`
- `GET/POST /api/notes` + `GET /api/notes/[patientId]`
- `GET/PATCH /api/odontogram/[patientId]/[fdi]`
- `GET/POST /api/invoices` + full CRUD `/api/invoices/[id]`
- `GET/POST /api/invoices/[id]/payments`
- `GET /api/invoices/[id]/pdf`
- `GET/POST /api/lab` + `/api/lab/[id]`
- `GET /api/recalls`
- `GET/POST /api/notes/[patientId]`
- `GET/POST /api/follow-ups` + `/api/follow-ups/[id]`
- `GET/POST /api/feedback` + `/api/feedback/[id]`
- `GET/PATCH /api/settings`
- `GET /api/audit-log`
- `GET /api/analytics`
- `GET /api/profiles`
- `POST /api/email/send` (stub)
