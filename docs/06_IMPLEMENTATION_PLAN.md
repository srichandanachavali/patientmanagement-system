# Implementation Plan — Step-by-Step Build Sequence

## Current State
Production-grade dental PMS fully built. 17 Prisma models migrated. All core features implemented: patient registration, odontogram (adult + pediatric with click-to-zoom focus editor), appointment scheduler, billing with PDF and UPI QR, prescriptions, lab cases, recall engine, audit log. Deployed on Vercel with Prisma + SQLite (dev) or Postgres (prod).

## Phase 1: Project Setup ✅
- Next.js App Router with TypeScript strict mode
- Tailwind CSS with custom design tokens (`tailwind.config.ts`)
- `components.json` — shadcn/ui primitives
- `prisma/schema.prisma` — 17-model schema defined upfront
- `package.json` — scripts: `db:migrate`, `db:seed`, `db:seed:production`, `db:studio`
- `.env` with `DATABASE_URL` + `SESSION_PASSWORD`

## Phase 2: Database & Schema ✅
- All 17 Prisma models defined: Patient, MedicalHistory, Consent, Appointment, ToothRecord, TreatmentPlan, Procedure, ClinicalNote, Attachment, Invoice, InvoiceLine, Payment, Prescription, LabCase, AuditLog, User, ClinicSettings
- `npm run db:migrate` — migrations applied
- `prisma/seed.ts` — dev seed with test users (Admin, Dentist, Receptionist) and sample patients
- `prisma/seed.production.ts` — production seed with real clinic data
- `src/lib/db.ts` — Prisma client singleton via `globalThis` (hot-reload safe)

## Phase 3: Authentication ✅
- `src/lib/session.ts` — iron-session config + `getSession()` / `requireSession()` helpers
- `POST /api/auth/login` — bcrypt.compare + iron-session cookie + `veda_role` cookie
- `POST /api/auth/logout` — `session.destroy()` + cookie clear
- `src/middleware.ts` — protects all `/(app)/*` routes; redirects to `/login`
- `src/app/(auth)/login/page.tsx` — RHF+Zod login form

## Phase 4: Core Types & Constants ✅
- `src/types/` — 6 type files: user, patient, appointment, clinical, billing, settings
- `src/types/index.ts` — re-exports all types (single import point)
- `src/constants/clinic.ts` — clinic name, phone, hours, chair count, GST rate, DPDP version
- `src/constants/enums.ts` — typed enum arrays: CONSENT_SCOPES, USER_ROLES, ATTACHMENT_TYPES
- `src/constants/fdi.ts` — FDI tooth notation lookup map (11–85)

## Phase 5: Layout & Navigation ✅
- `src/app/layout.tsx` — root HTML shell, Inter font
- `src/app/(app)/layout.tsx` — session check + AppShell wrapper
- `src/components/layout/AppShell.tsx` — Sidebar + TopBar composition
- `src/components/layout/Sidebar.tsx` — NAV_GROUPS with Lucide icons
- `src/components/layout/TopBar.tsx` — page title map + user chip + sign-out
- `src/components/layout/NavItem.tsx` — active-aware nav link

## Phase 6: Patient Management ✅
- `GET/POST /api/patients` — search (name/phone/ABHA) + create with MH + consents
- `GET/PATCH/DELETE /api/patients/[id]` — detail, edit, DPDP soft-erase
- `GET/POST /api/patients/[id]/attachments` — upload to `public/uploads/<id>/`
- Patient list page with 300ms debounced search
- New patient: ConsentCapture (3 DPDP scopes) + PatientForm
- Patient detail: allergy banner (WCAG AA 5.9:1 contrast), MH tags, recent appointments
- Drag-and-drop AttachmentUploader (10MB limit)
- EditPatientClient for updating demographics

## Phase 7: Appointment Scheduler ✅
- `GET/POST /api/appointments` + `GET/PATCH/DELETE /api/appointments/[id]`
- Day-view calendar: DayView → TimeGrid (15-min slots) + per-chair columns
- No-double-booking validation (same chair + overlapping time → 409)
- AppointmentBlock positioned in grid by time
- Status flow on appointment detail page
- Clinical notes attached to appointment

## Phase 8: Clinical Features ✅
- **Odontogram**: Adult chart (11–48) + Pediatric chart (51–85, auto-selected if DOB < 12 years)
  - Small anatomical SVG teeth with status fill and findings
  - Click-to-zoom: shared-element animation → ToothFocusEditor modal
  - ToothFocusEditor: large anatomical SVG (5 clickable surface regions + cervical)
  - Arrow-key navigation between teeth
  - Single source of truth: `toothConditions.ts` for statuses, findings, surfaces, palette, glyphs
  - `toothGeometry.ts` for small + large SVG geometries + arch placement
- Clinical notes: list + create form, linked to appointment
- Treatment plans: plan list + procedure breakdown
- Prescriptions: drug/dosage/frequency/duration list + printable letterhead

## Phase 9: Billing ✅
- `GET/POST /api/invoices` + full CRUD per invoice
- `GET/POST /api/invoices/[id]/payments`
- InvoiceForm: line items with per-row description, amount, tax_rate
- `PatientPicker` + `PdfDownloadButton` components
- `InvoicePDF`: `@react-pdf/renderer` template with clinic header + UPI QR
- `UpiQrCode`: `buildUpiLink()` generates UPI payment deep link as QR (no external dep)

## Phase 10: Lab, Recalls, Admin ✅
- Lab cases: list + detail + status tracking (Sent/In-Lab/Received/Fitted)
- Recalls: patients > 6 months without visit + no future appointment; wa.me links per patient
- Analytics stub
- Clinic settings page: chairCount, hours_json, gst_rates_json via `GET/PATCH /api/settings`
- Audit log: paginated table; INSERT-only records (no UPDATE/DELETE on AuditLog)

## Phase 11: Testing & Edge Cases
- [ ] Test no-double-booking (same chair, overlapping time)
- [ ] Test pediatric odontogram (patient DOB < 12 years → primary teeth 51–85)
- [ ] Test allergy banner visibility and contrast
- [ ] Test invoice PDF generation and download
- [ ] Test UPI QR code link format
- [ ] Test 10MB attachment limit enforcement
- [ ] Test DPDP consent — all 3 scopes, CLINICAL required
- [ ] Test recall list only shows patients > 6 months with no future appointment
- [ ] `npm run build` — zero TypeScript errors
- [ ] Role access: receptionist cannot access audit log (admin-only)

## Phase 12: Deployment
- Push to GitHub → Vercel auto-deploys
- Swap `DATABASE_URL` to production Postgres (Supabase or PlanetScale)
- Run `npm run db:seed:production` for initial clinic data
- Set `SESSION_PASSWORD` (32+ chars) in Vercel env
- Verify PDF generation works in Vercel serverless environment

## Done Criteria
- All 17 models seeded and accessible in UI
- Patient registration + consent + appointment + odontogram + invoice + PDF end-to-end complete
- No double-bookings possible
- Audit log recording every action
- DPDP consent captured at registration
- Zero TypeScript errors on `npm run build`
- Deployed and accessible at production URL
