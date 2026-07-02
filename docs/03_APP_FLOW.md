# App Flow — Navigation & User Journey Map

## Pages / Screens
### Auth
- `/login` — Login form (RHF+Zod; Suspense wraps useSearchParams)

### App (protected — requires `veda_session` cookie)
- `/dashboard` — Overview: 9 parallel metrics, today's appointments, revenue, outstanding balance, recall panel, wa.me links
- `/patients` — Patient list with debounced search (300ms); links to new patient
- `/patients/new` — New patient registration: ConsentCapture + PatientForm
- `/patients/[id]` — Patient detail: allergy banner, demographics, medical history tags, consents, attachments, recent appointments
- `/patients/[id]/edit` — Edit patient demographics and medical history
- `/appointments` — Day-view scheduler with per-chair columns
- `/appointments/new` — New appointment form with no-double-booking check
- `/appointments/[id]` — Appointment detail: status flow + clinical notes entry
- `/odontogram/[patientId]` — Odontogram: adult or pediatric FDI chart; click tooth → focus editor
- `/notes/[patientId]` — Clinical notes list + create form
- `/treatment-plans/[patientId]` — Treatment plan list + procedure breakdown
- `/billing` — Invoice list
- `/billing/new` — New invoice with line items and GST
- `/billing/[invoiceId]` — Invoice detail: PDF download button + UPI QR code
- `/prescriptions/[patientId]` — Prescription list + printable letterhead
- `/prescriptions/new` — New prescription with drug picker
- `/lab` — Lab cases list: Sent / In-Lab / Received / Fitted tabs
- `/lab/[id]` — Lab case detail
- `/recalls` — Recall list: patients > 6 months overdue, wa.me WhatsApp links
- `/analytics` — Analytics stub
- `/follow-ups` — Follow-up tracking
- `/feedback` — Patient feedback collection
- `/settings` — Clinic settings: name, hours, GST rates, chair count, branding
- `/audit-log` — Paginated audit log table (immutable records)

## Navigation Structure
- **AppShell** (`components/layout/AppShell.tsx`) — wraps all app pages; provides Sidebar + TopBar
- **Sidebar** (`components/layout/Sidebar.tsx`) — vertical left navigation; `NAV_GROUPS` with Lucide icons → NavItem active-aware links
- **TopBar** (`components/layout/TopBar.tsx`) — page title (from title map), user chip (name + role), sign-out button
- **NavItem** (`components/layout/NavItem.tsx`) — `"use client"` — active link highlighting via `usePathname()`

## Entry Point
Login page (`/login`) — `src/middleware.ts` redirects unauthenticated requests from any `/app` route to `/login`.

## Auth Flow
1. User visits any protected route → `src/middleware.ts` checks `veda_session` cookie
2. No session → redirect to `/login`
3. Login form submitted → `POST /api/auth/login`
4. bcrypt.compare password → if valid, `iron-session` sets `veda_session` cookie + `veda_role` cookie
5. Redirect to `/dashboard`
6. Sign-out: `POST /api/auth/logout` → `session.destroy()` + cookies cleared → redirect to `/login`

## Core User Journey 1 — Register New Patient + First Appointment
1. Receptionist logs in → Dashboard
2. Clicks "New Patient" → `/patients/new`
3. **ConsentCapture** step: checks CLINICAL (required), BILLING, REMINDERS — all 3 DPDP scopes
4. **PatientForm** step: name, DOB, gender, phone, email, address, ABHA number, emergency contact, preferred language (te/en)
5. Medical history: conditions (comma-separated), medications, allergies
6. Submit → POST `/api/patients` — creates Patient + MedicalHistory + Consent records in one transaction
7. Redirect to patient detail page — allergy banner visible if allergies entered
8. Receptionist clicks "New Appointment" → `/appointments/new`
9. Select patient (search), dentist, chair, date/time, duration, notes
10. Submit → POST `/api/appointments` — checks for chair conflict; saves appointment
11. Appointment appears on day-view scheduler

## Core User Journey 2 — Clinical Visit → Invoice → Payment
1. Dentist opens patient detail → sees allergy banner, medical history
2. Navigates to Odontogram → clicks tooth → focus editor opens (shared-element zoom)
3. Sets tooth status and surface findings → saves → PATCH `/api/odontogram/[patientId]/[fdi]`
4. Navigates to Notes → creates clinical note → POST `/api/notes`
5. Navigates to Treatment Plans → creates plan → adds procedures with codes and costs
6. After visit: Receptionist creates invoice `/billing/new`
7. InvoiceForm: select patient, add line items (optionally linked to procedures), set GST per line
8. Submit → POST `/api/invoices` — creates Invoice + InvoiceLines
9. Invoice detail page: click "Download PDF" → `@react-pdf/renderer` renders InvoicePDF
10. UPI QR code displayed → patient scans → pays
11. Receptionist records payment: amount, mode (Cash/UPI/Card/Insurance) → POST `/api/invoices/[id]/payments`

## Empty States
- No patients: patient list shows "No patients found" with "Register First Patient" button
- No appointments today: dashboard appointments widget shows empty state
- No invoices: billing page shows empty list
- Recall list empty: "All patients are up to date"

## Error States
- Double-booking attempt: `/api/appointments` returns 409 Conflict with error message
- Session expired: middleware redirects to `/login?error=session_expired`
- Prisma query error: API route returns 500 with error details
- Attachment > 10MB: `/api/patients/[id]/attachments` returns 413

## Redirects
- After login → `/dashboard`
- After logout → `/login`
- After new patient → `/patients/[id]` (patient detail)
- After new appointment → `/appointments`
- After new invoice → `/billing/[invoiceId]`
- Unauthenticated → `/login`
