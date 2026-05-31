<!-- F001 · CLAUDE.md · Master index + permanent operating protocol for VEDA Dental PMS -->

# Operating Protocol — VEDA Dental PMS

**These rules are permanent. Apply silently every session without being reminded.**

## 1 · Index-First Retrieval (token discipline)
For every prompt, task, or question:
1. Read `CLAUDE.md` (this file) first.
2. Use the index to identify the **minimum** set of files needed.
3. Open only those files — never bulk-load the repo.
After any file change, immediately update that file's row: **Last Updated**, **Dependencies**, **Related Files**.

## 2 · File Index Rule
Every file carries a unique `F-number` as its first comment. Reference files by F-number in all responses and docs. When a file is added or renamed, add/update its row in this table immediately.

## 3 · Error Protocol
Before solving **any** error: read `docs/ERRORS.md` (F900) — check for known resolutions.
After resolving: log immediately with: error message | root cause | fix | timestamp | affected files | status.
Never re-solve a known error from scratch.

## 4 · Phase Completion Protocol
After each build phase finishes:
1. `npm run build` → must be zero errors.
2. Manually verify key UI flows.
3. Update docs atomically:
   - `docs/TASKS.md` (F902) — DOING → DONE
   - `docs/TESTS.md` (F904) — check off / add cases
   - `docs/AUDIT.md` (F908) — date + score + failures
   - `docs/ERRORS.md` (F900) — anything that broke
   - `docs/MEMORY.md` (F901) — decisions made

## 5 · Self-Documenting Files
Every source file's first lines:
```
// ── F{N} · {relative-path}
// Purpose: {one line}
// In: {key inputs/deps} | Out: {key exports} | See: F{n}, F{n}
```
Update this header whenever purpose, inputs, or outputs change.

## 6 · Single Source of Truth
No information is duplicated across files. Each fact lives in exactly one place. Files reference each other by F-number only.

---

# Master File Index

| # | File | Purpose | Dependencies | Updated | Priority | Related |
|---|------|---------|--------------|---------|----------|---------|
| **ROOT / CONFIG** |
| F001 | CLAUDE.md | Master index + operating protocol | — | 2026-05-31 | CORE | all |
| F002 | prisma/schema.prisma | 17-model DB schema (SQLite via Prisma) | — | 2026-05-31 | CORE | F010 |
| F003 | package.json | Node deps + npm scripts (db:migrate, db:seed, db:studio) | — | 2026-05-31 | CORE | — |
| F004 | .env | DATABASE_URL + SESSION_PASSWORD | — | 2026-05-31 | CORE | F010, F011 |
| F005 | tailwind.config.ts | Tailwind CSS config + design tokens | — | 2026-05-31 | CORE | — |
| F006 | README.md | Quick-start + login table + Postgres swap guide | — | 2026-05-31 | MED | F004 |
| **CORE LIB** |
| F010 | src/lib/db.ts | Prisma client singleton — hot-reload safe via globalThis | F002, F004 | 2026-05-31 | CORE | F002 |
| F011 | src/lib/session.ts | iron-session config + getSession / requireSession helpers | F004 | 2026-05-31 | CORE | F013, F050, F051 |
| F012 | src/lib/utils.ts | cn / formatCurrency / formatDate / formatTime helpers | — | 2026-05-31 | CORE | — |
| F013 | src/middleware.ts | Route protection via veda_session cookie; role gate via veda_role cookie | F011 | 2026-05-31 | CORE | F011, F050 |
| **TYPES** |
| F020 | src/types/index.ts | Re-exports all entity types — import from here only | F021–F026 | 2026-05-31 | CORE | F021–F026 |
| F021 | src/types/user.ts | User + UserRole types | — | 2026-05-31 | HIGH | F020 |
| F022 | src/types/patient.ts | Patient / MedicalHistory / Consent / ConsentScope (UPPERCASE) types | — | 2026-05-31 | HIGH | F020, F140–F149 |
| F023 | src/types/appointment.ts | Appointment + AppointmentStatus types | — | 2026-05-31 | HIGH | F020, F150–F155 |
| F024 | src/types/clinical.ts | ClinicalNote / ToothRecord / TreatmentPlan types | — | 2026-05-31 | MED | F020, F160–F168 |
| F025 | src/types/billing.ts | Invoice / InvoiceLine / Payment types | — | 2026-05-31 | MED | F020, F170–F176 |
| F026 | src/types/settings.ts | ClinicSettings / ClinicHours types | — | 2026-05-31 | MED | F020, F030 |
| **CONSTANTS** |
| F030 | src/constants/clinic.ts | Clinic name / phone / hours / chair count / GST rate / DPDP version | — | 2026-05-31 | CORE | F026 |
| F031 | src/constants/enums.ts | Typed enum arrays: CONSENT_SCOPES, USER_ROLES, ATTACHMENT_TYPES | F020 | 2026-05-31 | HIGH | F022 |
| F032 | src/constants/fdi.ts | FDI tooth notation lookup map (11–85) | — | 2026-05-31 | MED | F160–F166 |
| **HOOKS** |
| F040 | src/hooks/usePatient.ts | Client hook — fetch + cache patient by id | F022, F060–F062 | 2026-05-31 | MED | F142–F149 |
| F041 | src/hooks/useAppointments.ts | Client hook — fetch appointments with filters | F023 | 2026-05-31 | MED | F150–F155 |
| F042 | src/hooks/useClinicHours.ts | Client hook — fetch clinic settings / hours | F026, F073 | 2026-05-31 | LOW | F185 |
| **API — AUTH** |
| F050 | src/app/api/auth/login/route.ts | POST /api/auth/login — bcrypt verify + iron-session + veda_role cookie | F010, F011 | 2026-05-31 | CORE | F051, F013 |
| F051 | src/app/api/auth/logout/route.ts | POST /api/auth/logout — session.destroy + cookie clear | F010, F011 | 2026-05-31 | CORE | F050, F013 |
| **API — PATIENTS** |
| F060 | src/app/api/patients/route.ts | GET search (name/phone/ABHA) + POST create with MH + consents | F010, F011, F022 | 2026-05-31 | HIGH | F061, F062, F140 |
| F061 | src/app/api/patients/[id]/route.ts | GET detail + PATCH update + DELETE DPDP soft-erase | F010, F011, F022 | 2026-05-31 | HIGH | F060, F062, F142 |
| F062 | src/app/api/patients/[id]/attachments/route.ts | GET list + POST upload → public/uploads/<id>/ (10 MB limit) | F010, F011 | 2026-05-31 | HIGH | F061, F148 |
| **API — OTHER** |
| F070 | src/app/api/lab/route.ts | GET + POST lab cases | F010, F011 | 2026-05-31 | STUB | F071, F182 |
| F071 | src/app/api/lab/[id]/route.ts | GET + PATCH + DELETE lab case | F010, F011 | 2026-05-31 | STUB | F070, F182 |
| F072 | src/app/api/recalls/route.ts | GET recall candidates (last visit > 6 mo + no future appt) | F010, F011 | 2026-05-31 | MED | F183 |
| F073 | src/app/api/settings/route.ts | GET + PATCH clinic settings (singleton id=1) | F010, F011 | 2026-05-31 | MED | F185, F030 |
| F074 | src/app/api/audit-log/route.ts | GET paginated audit log | F010, F011 | 2026-05-31 | MED | F186 |
| F075 | src/app/api/email/send/route.ts | POST email stub (no external service — returns ok) | F011 | 2026-05-31 | STUB | — |
| **APP LAYOUTS** |
| F100 | src/app/layout.tsx | Root HTML shell — Inter font + global CSS import | — | 2026-05-31 | CORE | F101, F102 |
| F101 | src/app/(auth)/layout.tsx | Centered card layout for login page | — | 2026-05-31 | CORE | F110 |
| F102 | src/app/(app)/layout.tsx | App shell — session check + redirect to /login + AppShell | F011, F120 | 2026-05-31 | CORE | F120–F123 |
| **AUTH PAGES** |
| F110 | src/app/(auth)/login/page.tsx | Login form (RHF+Zod) — Suspense wraps useSearchParams | F011, F050 | 2026-05-31 | CORE | F050 |
| **LAYOUT COMPONENTS** |
| F120 | src/components/layout/AppShell.tsx | Sidebar + TopBar wrapper — receives userName + userRole props | F121, F122 | 2026-05-31 | CORE | F121, F122, F102 |
| F121 | src/components/layout/Sidebar.tsx | 'use client' — NAV_GROUPS with Lucide icons → NavItem | F123, F030 | 2026-05-31 | CORE | F123, F120 |
| F122 | src/components/layout/TopBar.tsx | Page title map + user chip + sign-out button | F011, F051 | 2026-05-31 | CORE | F120, F121 |
| F123 | src/components/layout/NavItem.tsx | 'use client' — active-aware nav link with icon prop | — | 2026-05-31 | CORE | F121 |
| **DASHBOARD** |
| F130 | src/app/(app)/dashboard/page.tsx | 9 parallel Prisma queries; IST date math; recalls panel; wa.me links | F010, F011, F131–F133 | 2026-05-31 | HIGH | F131, F132, F133 |
| F131 | src/components/dashboard/RevenueWidget.tsx | Revenue today + this month + invoice count | F012 | 2026-05-31 | HIGH | F130 |
| F132 | src/components/dashboard/AppointmentsWidget.tsx | Today's appointment count + completion progress bar | — | 2026-05-31 | HIGH | F130 |
| F133 | src/components/dashboard/ReceivablesWidget.tsx | Outstanding balance + unpaid count + no-show % | F012 | 2026-05-31 | HIGH | F130 |
| **PATIENTS** |
| F140 | src/app/(app)/patients/page.tsx | Patient list + 300 ms debounced search → GET /api/patients | F060, F145 | 2026-05-31 | HIGH | F141, F142, F060 |
| F141 | src/app/(app)/patients/new/page.tsx | New patient — ConsentCapture + PatientForm → POST /api/patients | F060, F146, F147 | 2026-05-31 | HIGH | F060, F146, F147 |
| F142 | src/app/(app)/patients/[id]/page.tsx | Server Component — allergy banner, MH tags, consents, attachments, recent appts | F010, F144, F148 | 2026-05-31 | HIGH | F143, F144, F148, F061 |
| F143 | src/app/(app)/patients/[id]/edit/page.tsx | Server Component — reads Prisma, passes defaultValues to EditPatientClient | F010, F149 | 2026-05-31 | HIGH | F149, F061 |
| F144 | src/components/patients/AllergyBanner.tsx | Red allergy alert banner (danger-bg; WCAG AA 5.9:1) | — | 2026-05-31 | HIGH | F142 |
| F145 | src/components/patients/PatientCard.tsx | Patient list card — allergy badge + language tag (snake_case API shape) | F022, F012 | 2026-05-31 | HIGH | F140 |
| F146 | src/components/patients/PatientForm.tsx | RHF+Zod — demographics + medical history (comma-separated inputs) | — | 2026-05-31 | HIGH | F141, F149 |
| F147 | src/components/patients/ConsentCapture.tsx | DPDP consent checkboxes — 3 uppercase scopes (CLINICAL required) | F031, F030 | 2026-05-31 | HIGH | F141 |
| F148 | src/components/patients/AttachmentUploader.tsx | Drag-and-drop + click upload → POST /api/patients/[id]/attachments | F062 | 2026-05-31 | HIGH | F142, F062 |
| F149 | src/components/patients/EditPatientClient.tsx | 'use client' — form submit → PATCH /api/patients/[id] | F061, F146 | 2026-05-31 | HIGH | F143, F061 |
| **APPOINTMENTS / SCHEDULER** |
| F150 | src/app/(app)/appointments/page.tsx | Day-view calendar with per-chair columns | F010, F153–F155 | 2026-05-31 | HIGH | F151, F152, F153 |
| F151 | src/app/(app)/appointments/new/page.tsx | New appointment form — no-double-booking validation | F010, F011 | 2026-05-31 | HIGH | F150 |
| F152 | src/app/(app)/appointments/[id]/page.tsx | Appointment detail — status flow + clinical notes | F010, F011 | 2026-05-31 | HIGH | F150 |
| F153 | src/components/scheduler/DayView.tsx | Day/chair grid with time slots | F154, F155 | 2026-05-31 | HIGH | F150 |
| F154 | src/components/scheduler/TimeGrid.tsx | Time ruler — 15-min slot columns | F030 | 2026-05-31 | HIGH | F153 |
| F155 | src/components/scheduler/AppointmentBlock.tsx | Appointment card positioned in the grid | F023 | 2026-05-31 | HIGH | F153 |
| **ODONTOGRAM / CLINICAL** |
| F160 | src/app/(app)/odontogram/[patientId]/page.tsx | Odontogram page — FDI tooth status view/edit | F010, F161, F162 | 2026-05-31 | HIGH | F161–F166 |
| F161 | src/components/odontogram/Odontogram.tsx | Root odontogram — adult/pediatric mode switch | F163, F164 | 2026-05-31 | HIGH | F160, F162 |
| F162 | src/components/odontogram/OdontogramWrapper.tsx | 'use client' — fetches tooth records, passes to Odontogram | F010, F161 | 2026-05-31 | HIGH | F160, F161 |
| F163 | src/components/odontogram/AdultChart.tsx | Adult FDI chart (teeth 11–48) | F165, F032 | 2026-05-31 | HIGH | F161, F164 |
| F164 | src/components/odontogram/PediatricChart.tsx | Pediatric FDI chart (teeth 51–85) | F165, F032 | 2026-05-31 | HIGH | F161, F163 |
| F165 | src/components/odontogram/Tooth.tsx | Single tooth SVG with status-based fill color | F166 | 2026-05-31 | HIGH | F163, F164 |
| F166 | src/components/odontogram/ToothStatusPicker.tsx | Status picker modal (HEALTHY/CARIES/FILLED/MISSING/etc.) | F024 | 2026-05-31 | HIGH | F165 |
| F167 | src/app/(app)/notes/[patientId]/page.tsx | Clinical notes list + create form | F010, F011 | 2026-05-31 | STUB | F168 |
| F168 | src/app/(app)/treatment-plans/[patientId]/page.tsx | Treatment plan list + phase breakdown | F010, F011 | 2026-05-31 | STUB | F167 |
| **BILLING** |
| F170 | src/app/(app)/billing/page.tsx | Invoice list stub | F010, F011 | 2026-05-31 | STUB | F171, F172 |
| F171 | src/app/(app)/billing/new/page.tsx | New invoice form | F010, F011, F173 | 2026-05-31 | STUB | F173 |
| F172 | src/app/(app)/billing/[invoiceId]/page.tsx | Invoice detail + PDF download + UPI QR | F010, F011, F174, F176 | 2026-05-31 | STUB | F174, F175, F176 |
| F173 | src/components/billing/InvoiceForm.tsx | Invoice line items + per-line GST + partial payment form | F025 | 2026-05-31 | HIGH | F171 |
| F174 | src/components/billing/InvoicePDF.tsx | @react-pdf/renderer VEDA invoice PDF template | F025, F030 | 2026-05-31 | HIGH | F175, F172 |
| F175 | src/components/billing/PdfDownloadButton.tsx | Client button — renders InvoicePDF on demand | F174 | 2026-05-31 | HIGH | F172, F174 |
| F176 | src/components/billing/UpiQrCode.tsx | UPI QR code generator (buildUpiLink inlined — no external dep) | — | 2026-05-31 | HIGH | F172 |
| **PRESCRIPTIONS / LAB / ADMIN** |
| F180 | src/app/(app)/prescriptions/[patientId]/page.tsx | Prescription list + printable letterhead | F010, F011 | 2026-05-31 | STUB | F181 |
| F181 | src/app/(app)/prescriptions/new/page.tsx | New prescription with drug picker | F010, F011 | 2026-05-31 | STUB | F180 |
| F182 | src/app/(app)/lab/page.tsx | Lab cases list (pending/sent/received) | F010, F011 | 2026-05-31 | STUB | F070, F071 |
| F183 | src/app/(app)/recalls/page.tsx | Recall list — wa.me links for patients overdue 6+ months | F010, F011 | 2026-05-31 | MED | F072 |
| F184 | src/app/(app)/analytics/page.tsx | Analytics stub | F010, F011 | 2026-05-31 | STUB | — |
| F185 | src/app/(app)/settings/page.tsx | Clinic settings form (chairCount, hours, GST) | F010, F011, F073 | 2026-05-31 | MED | F073, F030 |
| F186 | src/app/(app)/audit-log/page.tsx | Audit log paginated table | F010, F011, F074 | 2026-05-31 | MED | F074 |
| **SHARED COMPONENTS** |
| F190 | src/components/shared/StatusBadge.tsx | Reusable appointment status pill | F023 | 2026-05-31 | MED | F150–F155 |
| F191 | src/components/shared/SkeletonLoader.tsx | Animated loading skeleton placeholder | — | 2026-05-31 | MED | — |
| F192 | src/components/shared/Toast.tsx | Toast notification component | — | 2026-05-31 | MED | — |
| **DOCS** |
| F900 | docs/ERRORS.md | Known errors log — error / root cause / fix / timestamp / status | — | 2026-05-31 | CORE | — |
| F901 | docs/MEMORY.md | Architectural decisions log — date / decision / rationale | — | 2026-05-31 | CORE | — |
| F902 | docs/TASKS.md | Sprint task board: TODO / DOING / DONE | — | 2026-05-31 | CORE | — |
| F903 | docs/DEPLOY.md | Step-by-step deployment + ENV NEEDED section | F004 | 2026-05-31 | HIGH | F004 |
| F904 | docs/TESTS.md | Manual + automated test checklist (`- [ ]` format) | — | 2026-05-31 | HIGH | — |
| F905 | docs/SCHEMA.md | DB field reference for all 17 Prisma models | F002 | 2026-05-31 | HIGH | F002 |
| F906 | docs/ENV.md | All env vars + how to obtain + which file uses each | F004 | 2026-05-31 | HIGH | F004, F010, F011 |
| F907 | docs/STYLE.md | Design system: fonts / colors / spacing / animation | F005 | 2026-05-31 | MED | F005 |
| F908 | docs/AUDIT.md | Lighthouse / a11y audit score history table | — | 2026-05-31 | MED | — |
| F909 | docs/API.md | API route signatures + request/response shapes | F050–F075, F060–F062 | 2026-05-31 | HIGH | F050–F075 |
| F910 | docs/ARCHITECTURE.md | System layer diagram + data-flow description | — | 2026-05-31 | HIGH | — |
| F911 | docs/ROUTES.md | All app routes + role access gates + page purpose | F013 | 2026-05-31 | HIGH | F013 |
| F912 | docs/SECURITY.md | DPDP Act compliance + role permission matrix + RLS notes | F011, F013 | 2026-05-31 | HIGH | F011, F013 |
| F913 | docs/FILEMAP.md | Complete file tree with one-line purpose per file | — | 2026-05-31 | MED | F001 |
