<!-- F912 · docs/SECURITY.md · DPDP Act compliance + role permission matrix + RLS notes -->

# VEDA Dental PMS — Security & Compliance

## Regulatory Baseline
- **India DPDP Act 2023 + Rules 2025** (operative since Nov 2025) is the primary compliance framework.
- System stores personal data: name, phone, email, DOB, address, medical history, ABHA number, payment records.
- ABHA number is sensitive personal data; stored encrypted at rest (Supabase AES-256 at storage layer).
- Clinic is a *data fiduciary* under DPDP — legal obligations apply even as a single small clinic.

---

## Consent (DPDP Act §6)
- Explicit consent captured at patient registration — blanket consent is invalid under DPDP.
- Consent record stores: patient_id, notice_version, scope, granted_at.
- Consent is granular: clinical data, billing data, and reminder communications are separate scopes.
- Patients may withdraw consent; withdrawn_at is recorded and erasure workflow is triggered.
- Consent notice is presented in the patient's preferred_language (Telugu or English).
- Notice version is stored so future version changes can be tracked and re-consent requested if scope changes.

---

## Patient Rights (DPDP Act §11–13)

| Right | Implementation |
|-------|---------------|
| Right of Access | Admin can export all data for a patient_id via GET /api/patients/[id] full export endpoint |
| Right of Correction | Receptionist or Admin edits patient data; all edits logged in AuditLog |
| Right of Erasure | Admin-only soft delete sets withdrawn_at on Consent; hard delete scheduled after retention period <!-- TBD: confirm retention period with clinic — likely 7 years per Indian medical records norms --> |

---

## Data Minimization
- Only fields required for clinical care and billing are collected.
- ABHA number is optional (nullable in schema).
- Emergency contact is free text, not linked to another Patient record (avoids collecting third-party data without consent).

---

## Breach Readiness (DPDP Act §8)
- Target: 72-hour breach notification to India's Data Protection Board.
- AuditLog is the primary forensic artifact; it is immutable (no UPDATE or DELETE operations on AuditLog rows ever).
- <!-- TBD: Define breach notification runbook and responsible contact -->
- <!-- TBD: Define automated alerting for unusual access patterns (e.g. bulk exports) -->

---

## Encryption
- **In transit:** HTTPS enforced by Vercel (TLS 1.3) and Supabase (TLS 1.2+).
- **At rest:** Supabase Postgres and Storage use AES-256 managed by Supabase infrastructure.
- **Application-layer:** No additional application-layer encryption in Phase D; re-evaluate for ABHA number field in Phase 1.

---

## Role Permission Matrix

| Action | Admin | Dentist | Assistant | Receptionist |
|--------|-------|---------|-----------|--------------|
| View patient list | Y | Y | Y | Y |
| Create patient | Y | N | N | Y |
| Edit patient demographics | Y | N | N | Y |
| Delete / erase patient | Y | N | N | N |
| View medical history | Y | Y | Y | N |
| Edit medical history | Y | Y | N | N |
| View odontogram | Y | Y | Y | Read-only |
| Edit odontogram | Y | Y | Y | N |
| Create clinical note | Y | Y | N | N |
| View clinical notes | Y | Y | Y | N |
| Upload X-rays / attachments | Y | Y | Y | N |
| Create appointment | Y | N | N | Y |
| Update appointment status | Y | Y | Y | N |
| Send wa.me reminder | Y | N | N | Y |
| Create invoice | Y | N | N | Y |
| Record payment | Y | N | N | Y |
| View receivables | Y | N | N | Y |
| Create prescription | Y | Y | N | N |
| View all analytics | Y | Own only | N | N |
| View audit log | Y | N | N | N |
| Edit clinic settings | Y | N | N | N |
| Track lab cases | Y | Y | Y | N |
| Manage recalls | Y | Y | N | N |

---

## Supabase Row Level Security (RLS)
- RLS is enabled on every table — the anon key cannot read another patient's data even if an API route has a bug.
- Policies enforce role-based access at the database level (defense in depth beyond API route middleware checks).
- AuditLog: INSERT allowed for service_role only; SELECT for Admin role only; no UPDATE or DELETE ever permitted.
- Attachment storage_url is never returned directly from any API route; always replaced server-side with a 1-hour signed URL.

---

## Secrets Management
- SUPABASE_SERVICE_ROLE_KEY: Never in client bundle. Server-only (API routes). Rotate immediately if exposed.
- ANTHROPIC_API_KEY: Server-only API routes. Never in a NEXT_PUBLIC_ prefixed variable.
- RESEND_API_KEY / BREVO_API_KEY: Server-only.
- `.env.local` is gitignored. `.env.example` contains placeholder values only (never real keys).

---

## Backup & Recovery
- **Supabase free tier:** Point-in-time recovery not available. Mitigate with daily backup via Supabase dashboard export + pg_dump script.
- <!-- TBD: Automate pg_dump via Vercel Cron or GitHub Actions before go-live -->
- **Supabase Pro tier ($25/mo):** 7-day point-in-time recovery. Upgrade recommended before first real patient data is entered.
- **Storage backups (X-rays):** <!-- TBD: Define backup strategy for Supabase Storage buckets -->
- Restore procedure must be tested before go-live — a clinic losing historical patient data is both a disaster and a reportable DPDP breach.

---

## Demo-Specific Security Notes
- Demo seed data must use fictional patient names and phone numbers only — never real patient data.
- Demo environment must use a separate Supabase project from any future production project.
- Vercel preview deployment URLs are public and indexable — confirm demo seed data contains nothing sensitive.
