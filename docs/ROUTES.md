<!-- F911 · docs/ROUTES.md · All app routes + role access gates + page purpose -->

# VEDA Dental PMS — Route Reference

## Role Abbreviations
- **A** = Admin
- **D** = Dentist
- **As** = Assistant
- **R** = Receptionist

"All" = any authenticated user. "PUBLIC" = no auth required.

| Route | Page Purpose | Roles Allowed | Notes |
|-------|-------------|---------------|-------|
| /login | Email + password login form | PUBLIC | Redirects to /dashboard if session already exists |
| /dashboard | Overview: today's schedule, revenue summary, outstanding payments, quick actions | All | Role-specific widget visibility (Admin sees all revenue; Dentist sees own appointments) |
| /patients | Searchable patient list | All | Search by name, phone, ABHA number |
| /patients/new | New patient intake form with consent capture | R, A | DPDP consent captured here |
| /patients/[id] | Patient record: demographics, medical history, allergy banner, tabs for clinical/billing/attachments | All | Red allergy banner always visible if allergies present |
| /patients/[id]/edit | Edit patient demographics | R, A | All edits logged in AuditLog |
| /appointments | Calendar day/week view of all chairs and dentists | All | Filter by dentist or chair; VEDA hours pre-loaded |
| /appointments/new | Create new appointment | R, A | Conflict detection on submit; validates against clinic hours |
| /appointments/[id] | Appointment detail: notes, status, wa.me reminder link | All | Status update: D, As; reminder send: R, A |
| /odontogram/[patientId] | Interactive FDI odontogram (adult + pediatric, per-tooth + per-surface status) | D, As, A | Read-only for R |
| /treatment-plans/[patientId] | Treatment plan list and procedure editor | D, A | |
| /notes/[patientId] | Clinical notes timeline | D, As, A | Write access: D only |
| /attachments/[patientId] | X-ray and document gallery (served via signed URLs) | D, As, A | Upload: D, As |
| /billing | Invoice list + receivables overview (who owes what) | R, A | |
| /billing/new | Create invoice with procedure line items and GST | R, A | |
| /billing/[invoiceId] | Invoice detail: payment history, PDF download with UPI QR | R, A | |
| /prescriptions/[patientId] | Prescription list for a patient | D, A | |
| /prescriptions/new | Create digital prescription (drug picker, dosage, duration) | D | Prints with VEDA letterhead + dentist details |
| /lab | Lab case tracking list (crowns, dentures, aligners) | D, As, A | |
| /recalls | Overdue recall patient list with AI priority ranking | A, D | Recall due-this-week list |
| /analytics | Revenue, appointment counts, recall rate, no-show %, new vs returning patients | A | Dentist sees own stats only <!-- TBD: implement per-dentist filter --> |
| /settings | Clinic name, hours, GST rates, branding (logo, accent color) | A | Hours feed into appointment slot validation |
| /audit-log | AuditLog viewer: who accessed which record, when | A | Read-only; no DELETE on audit records |

## Middleware Behavior
- Unauthenticated requests to any route except /login redirect to /login.
- Authenticated requests to /login redirect to /dashboard.
- Role violations return HTTP 403 with a clear "Access denied" page — not a redirect to login.
- Middleware runs in Node.js runtime (not Edge) to support Supabase Auth cookie validation (see ERRORS.md).
