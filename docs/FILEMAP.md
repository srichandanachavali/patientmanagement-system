<!-- F913 · docs/FILEMAP.md · Complete file tree with one-line purpose per file -->

# VEDA Dental PMS — File Map

Every file in the project with a one-line purpose.
`[stub]` = file exists but has no logic yet; implemented in the named phase.

---

## Root Config

| File | Purpose |
|------|---------|
| package.json | Dependencies and npm scripts |
| tsconfig.json | TypeScript compiler config (strict mode, path aliases) |
| next.config.ts | Next.js config (image domains, env exposure) |
| tailwind.config.ts | Design tokens from docs/STYLE.md (colors, fonts, spacing) |
| .env.example | Placeholder env vars — copy to .env.local to develop |
| .env.local | Real secrets — gitignored, never committed |
| src/middleware.ts | Next.js middleware: session check + role gate for all (app) routes |

---

## docs/

| File | Purpose |
|------|---------|
| docs/CLAUDE.md | Index of all /docs files |
| docs/FILEMAP.md | This file — full project file tree |
| docs/SCHEMA.md | DB schema + CORE TypeScript contracts (source of truth for types) |
| docs/TASKS.md | 23-phase build plan with one-line execution prompts |
| docs/MEMORY.md | Architectural decision log |
| docs/DEPLOY.md | Step-by-step deployment guide |
| docs/TESTS.md | Manual test checklist |
| docs/ENV.md | Environment variable reference |
| docs/STYLE.md | Design system: fonts, colors, spacing, animation |
| docs/AUDIT.md | Lighthouse score history |
| docs/API.md | All API route signatures |
| docs/ROUTES.md | All app routes with role access gates |
| docs/ARCHITECTURE.md | System layer diagram and data-flow walkthroughs |
| docs/SECURITY.md | DPDP compliance, role permission matrix, RLS policy rules |
| docs/ERRORS.md | Error log: ERROR / FIX / FILE blocks |

---

## src/types/

| File | Purpose |
|------|---------|
| src/types/index.ts | Re-exports all entity types from sub-files |
| src/types/patient.ts | Patient, MedicalHistory, Consent interfaces |
| src/types/appointment.ts | Appointment interface + AppointmentStatus type |
| src/types/clinical.ts | ToothRecord, TreatmentPlan, Procedure, ClinicalNote, Attachment |
| src/types/billing.ts | Invoice, InvoiceLine, Payment, Prescription, LabCase |
| src/types/user.ts | User interface + UserRole type |
| src/types/settings.ts | ClinicSettings, ClinicHours, branding_json shape |

---

## src/constants/

| File | Purpose |
|------|---------|
| src/constants/enums.ts | All string literal unions: AppointmentStatus, ToothStatus, ToothSurface, etc. |
| src/constants/fdi.ts | FDI tooth map: number → { name, type (adult/primary), quadrant } |
| src/constants/clinic.ts | VEDA hours object, chair count (3), default GST rate |

---

## src/lib/

| File | Purpose |
|------|---------|
| src/lib/supabase/client.ts | Supabase browser client (anon key, RLS enforced) |
| src/lib/supabase/server.ts | Supabase server client (service role, for API routes) |
| src/lib/supabase/middleware.ts | Supabase session refresh helper for src/middleware.ts |
| src/lib/ai/anthropic.ts | Anthropic SDK client instance (server-only) |
| src/lib/email/resend.ts | Resend client + send helper with Brevo fallback |
| src/lib/pdf/upi-qr.ts | UPI deep link string encoder for QR code generation |
| src/lib/utils.ts | cn() for class merging, formatCurrency (INR), formatDate (IST) |

---

## src/hooks/

| File | Purpose |
|------|---------|
| src/hooks/useClinicHours.ts | Returns parsed ClinicSettings.hours_json as slot arrays |
| src/hooks/usePatient.ts | Fetches patient + medical history + consent for a given id |
| src/hooks/useAppointments.ts | Fetches appointments filtered by date/dentist/chair |

---

## src/app/ — Pages

| File | Purpose |
|------|---------|
| src/app/layout.tsx | Root HTML layout, next/font setup, global providers |
| src/app/globals.css | CSS custom properties for design tokens, base resets |
| src/app/(auth)/login/page.tsx | Email + password login form |
| src/app/(app)/layout.tsx | App shell: wraps all authenticated pages with AppShell |
| src/app/(app)/dashboard/page.tsx | Owner dashboard: revenue, today's schedule, receivables |
| src/app/(app)/patients/page.tsx | Searchable patient list |
| src/app/(app)/patients/new/page.tsx | New patient intake form with DPDP consent capture |
| src/app/(app)/patients/[id]/page.tsx | Patient record: demographics, allergy banner, clinical tabs |
| src/app/(app)/patients/[id]/edit/page.tsx | Edit patient demographics |
| src/app/(app)/appointments/page.tsx | Day-view scheduler: columns per chair |
| src/app/(app)/appointments/new/page.tsx | Book new appointment form |
| src/app/(app)/appointments/[id]/page.tsx | Appointment detail: status, notes, wa.me reminder |
| src/app/(app)/odontogram/[patientId]/page.tsx | Interactive FDI odontogram for a patient |
| src/app/(app)/treatment-plans/[patientId]/page.tsx | Treatment plan list and procedure editor |
| src/app/(app)/billing/page.tsx | Invoice list + receivables overview |
| src/app/(app)/billing/new/page.tsx | Create invoice with procedure line items and GST |
| src/app/(app)/billing/[invoiceId]/page.tsx | Invoice detail: payments, PDF download |
| src/app/(app)/prescriptions/new/page.tsx | Create digital prescription |
| src/app/(app)/prescriptions/[patientId]/page.tsx | Prescription history for a patient |
| src/app/(app)/lab/page.tsx | Lab case tracking list |
| src/app/(app)/recalls/page.tsx | Overdue recall list with AI priority |
| src/app/(app)/analytics/page.tsx | Owner analytics: revenue, no-show %, recall rate |
| src/app/(app)/settings/page.tsx | Clinic settings: hours, GST, branding |
| src/app/(app)/audit-log/page.tsx | Audit log viewer (Admin only) |

---

## src/app/api/ — API Routes

| File | Purpose |
|------|---------|
| src/app/api/auth/login/route.ts | POST: Supabase signInWithPassword, set session cookie |
| src/app/api/auth/logout/route.ts | POST: clear session cookie |
| src/app/api/patients/route.ts | GET list (search), POST create + consent + audit |
| src/app/api/patients/[id]/route.ts | GET, PATCH, DELETE (soft-erase) single patient |
| src/app/api/appointments/route.ts | GET filtered list, POST create with conflict check |
| src/app/api/appointments/[id]/route.ts | PATCH status/notes, DELETE cancel |
| src/app/api/odontogram/[patientId]/route.ts | GET all ToothRecords for patient |
| src/app/api/odontogram/[patientId]/[toothFdi]/route.ts | PUT upsert single tooth status + surface |
| src/app/api/notes/route.ts | POST create clinical note |
| src/app/api/notes/[patientId]/route.ts | GET all notes for patient (desc order) |
| src/app/api/treatment-plans/route.ts | POST create treatment plan with procedures |
| src/app/api/treatment-plans/[id]/route.ts | PATCH status, add/update procedures |
| src/app/api/prescriptions/route.ts | POST create prescription |
| src/app/api/prescriptions/[patientId]/route.ts | GET all prescriptions for patient |
| src/app/api/attachments/route.ts | POST upload file to Supabase Storage |
| src/app/api/attachments/[id]/route.ts | GET returns 1-hour signed URL for attachment |
| src/app/api/invoices/route.ts | GET list with status filter + outstanding sum, POST create |
| src/app/api/invoices/[id]/route.ts | GET invoice with lines + payments |
| src/app/api/invoices/[id]/payments/route.ts | POST record payment, update invoice status |
| src/app/api/invoices/[id]/pdf/route.ts | GET invoice data formatted for client-side PDF render |
| src/app/api/lab/route.ts | GET lab cases, POST create |
| src/app/api/lab/[id]/route.ts | PATCH status and expected_back date |
| src/app/api/recalls/route.ts | GET patients overdue for recall |
| src/app/api/ai/draft-reminder/route.ts | POST: Anthropic → Telugu or English reminder draft |
| src/app/api/ai/summarize-note/route.ts | POST: Anthropic → SOAP-format clinical note summary |
| src/app/api/ai/recall-priority/route.ts | POST: Anthropic → prioritized recall patient list |
| src/app/api/settings/route.ts | GET clinic settings, PATCH update (Admin only) |
| src/app/api/audit-log/route.ts | GET audit log entries with filters (Admin only) |
| src/app/api/email/send/route.ts | POST send email via Resend (fallback: Brevo) |

---

## src/components/

| File | Purpose |
|------|---------|
| src/components/ui/ | shadcn/ui primitives (added by CLI in Phase C1) |
| src/components/layout/AppShell.tsx | Root layout: sidebar + main content area |
| src/components/layout/Sidebar.tsx | 240px nav sidebar with all routes and VEDA branding |
| src/components/layout/TopBar.tsx | Top bar: page title, user menu, notifications |
| src/components/layout/NavItem.tsx | Single sidebar nav link with active state |
| src/components/odontogram/Odontogram.tsx | Root: picks AdultChart or PediatricChart based on patient DOB |
| src/components/odontogram/AdultChart.tsx | 32-tooth SVG grid in FDI quadrant layout (11–48) |
| src/components/odontogram/PediatricChart.tsx | 20-tooth SVG grid in FDI primary notation (51–85) |
| src/components/odontogram/Tooth.tsx | Single tooth SVG: color = ToothStatus, CSS transitions |
| src/components/odontogram/ToothStatusPicker.tsx | Popover: ToothStatus selector + optional surface checkboxes |
| src/components/scheduler/DayView.tsx | Full-day column-per-chair calendar grid |
| src/components/scheduler/TimeGrid.tsx | Time slots from clinic open to close (respects hours_json) |
| src/components/scheduler/AppointmentBlock.tsx | Rendered appointment block: patient name, status badge |
| src/components/patients/PatientCard.tsx | Compact patient summary card for list view |
| src/components/patients/AllergyBanner.tsx | Red danger banner shown when patient.allergies.length > 0 |
| src/components/patients/PatientForm.tsx | New/edit patient fields: all Patient + MedicalHistory fields |
| src/components/patients/ConsentCapture.tsx | DPDP consent checkboxes: clinical, billing, reminders scopes |
| src/components/billing/InvoiceForm.tsx | Add procedure line items, GST rate, payment mode |
| src/components/billing/InvoicePDF.tsx | @react-pdf/renderer document: VEDA letterhead + GST + UPI QR |
| src/components/billing/UpiQrCode.tsx | Generates UPI deep link string, renders as QR image in PDF |
| src/components/dashboard/RevenueWidget.tsx | Today's revenue + this month's revenue from seeded/real data |
| src/components/dashboard/AppointmentsWidget.tsx | Today's appointment count + next upcoming |
| src/components/dashboard/ReceivablesWidget.tsx | Total outstanding payments with patient count |
| src/components/shared/StatusBadge.tsx | Color-coded pill badge for AppointmentStatus, InvoiceStatus, etc. |
| src/components/shared/SkeletonLoader.tsx | Pulse skeleton for loading states on data-heavy pages |
| src/components/shared/Toast.tsx | Slide-in toast notification (top-right, 200ms) |

---

## supabase/

| File | Purpose |
|------|---------|
| supabase/config.toml | Supabase local dev config (project ref, port) |
| supabase/migrations/0001_initial_schema.sql | All 17 tables with FK constraints, types, RLS enable |
| supabase/migrations/0002_rls_policies.sql | Role-based RLS policies per docs/SECURITY.md role matrix |
| supabase/migrations/0003_seed_functions.sql | Helper functions for seed data generation |
| supabase/seed.sql | Demo data: 3 dentists, 20 patients, appointments, 5 invoices |
