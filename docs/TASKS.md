<!-- F902 · docs/TASKS.md · Sprint task board: TODO / DOING / DONE -->

# VEDA Dental PMS — Task Board

Build order: CORE → UI → BACKEND → CONNECTIONS.
Each phase is one focused session. Trigger with the one-line prompt in quotes.
Move tasks between sections as work progresses.

---

## TODO

### CORE Layer

- [x] **C1 — Project Scaffold** | Files: package.json, tsconfig.json, next.config.mjs, tailwind.config.ts, components.json, src/lib/utils.ts, globals.css | Done 2026-05-30: `npm run dev` starts clean, `tsc --noEmit` passes, shadcn default style, tailwindcss-animate installed
- [x] **C2 — Types + Constants** | Files: src/types/*.ts (6 files), src/constants/enums.ts, fdi.ts, clinic.ts | Done 2026-05-30: all 17 entity interfaces + 14 union types + FDI map (52 teeth) + clinic constants exported; `tsc --noEmit` passes
- [x] **C3 — Client Setup** | Files: src/lib/supabase/{client,server,middleware}.ts, src/lib/ai/anthropic.ts, src/lib/email/resend.ts, src/lib/pdf/upi-qr.ts, src/lib/utils.ts | Done 2026-05-30: all clients implemented; utils exports cn + formatCurrency + formatDate + formatTime; `tsc --noEmit` passes

### UI Layer (stub data — no API calls)

- [x] **U1 — App Shell** | Files: src/components/layout/{AppShell,Sidebar,TopBar,NavItem}.tsx, src/app/layout.tsx (Inter + JetBrains Mono fonts), src/app/(app)/layout.tsx | Done 2026-05-30: 240px sidebar with 4 nav groups + 9 routes, active highlighting via usePathname, topbar with page title, fonts wired via CSS variables; `tsc --noEmit` passes, dev starts in 3.4s
- [x] **U2 — Dashboard Stub** | Files: src/app/(app)/dashboard/page.tsx, src/components/dashboard/{RevenueWidget,AppointmentsWidget,ReceivablesWidget}.tsx | Done 2026-05-30: 3 stat cards (₹18,500 revenue / 12 appointments / ₹42,300 outstanding), 12-row schedule list with status badges, quick action links; `tsc --noEmit` passes
- [x] **U3 — Odontogram** | Files: src/components/odontogram/{Tooth,ToothStatusPicker,AdultChart,PediatricChart,Odontogram}.tsx, odontogram/[patientId]/page.tsx | Done 2026-05-30: 32-tooth adult + 20-tooth pediatric SVG charts; CSS fill transitions 150ms; click→picker with 7-status radio + 5-surface toggle; auto-switches chart by age; legend; `tsc --noEmit` passes
- [x] **U4 — Scheduler Stub** | Files: src/components/scheduler/{DayView,TimeGrid,AppointmentBlock}.tsx, appointments/page.tsx | Done 2026-05-30: 3-chair column grid at 64px/hr; absolute-positioned blocks; 15-min slot lines; Mon–Sat 09:30–21:00 / Sun 09:30–13:00; date nav (prev/today/next); `tsc --noEmit` passes
- [x] **U5 — Patient UI Stub** | Files: src/components/patients/{AllergyBanner,PatientCard,PatientForm,ConsentCapture}.tsx, patients/{page,new/page,[id]/page}.tsx | Done 2026-05-30: 15-patient stub list with name/phone/ABHA search; Zod+RHF form all Patient+MedicalHistory fields; DPDP consent 3 scopes (clinical required); allergy banner WCAG AA; `tsc --noEmit` passes
- [x] **U6 — Billing Stub** | Files: src/components/billing/{InvoiceForm,InvoicePDF,UpiQrCode,PdfDownloadButton}.tsx, billing/{page,new/page,[invoiceId]/page}.tsx | Done 2026-05-30: 5-invoice list with status badges; dynamic line items form (Zod+RHF); @react-pdf/renderer A4 PDF with VEDA letterhead+GST table; UPI QR via qrcode canvas+dataUrl; usePDF hook for typed download; `tsc --noEmit` passes

### BACKEND Layer

- [x] **B1 — Database + RLS** | Files: supabase/migrations/0001_initial_schema.sql, 0002_rls_policies.sql | Done 2026-05-30: 17 tables with FK constraints, indexes, chair-overlap EXCLUDE constraint, handle_new_user trigger; get_my_role() SECURITY DEFINER helper; full RLS per role matrix; audit_log permanently blocks authenticated INSERT/UPDATE/DELETE — requires live Supabase project + .env.local to push
- [x] **B2 — Auth + Middleware** | Files: src/middleware.ts, src/app/(auth)/layout.tsx, src/app/(auth)/login/page.tsx, src/app/api/auth/login/route.ts, src/app/api/auth/logout/route.ts, src/components/layout/TopBar.tsx | Done 2026-05-30: session refresh on every request; unauthenticated → /login?next=; role gates return 403 HTML; RHF+Zod login form with password toggle; TopBar sign-out wired; `tsc --noEmit` passes
- [x] **B3 — Patient API** | Files: src/lib/supabase/admin.ts, src/app/api/patients/route.ts, src/app/api/patients/[id]/route.ts | Done 2026-05-30: GET ?q= searches name/phone/abha_number; POST creates patient+medical_history+consents+audit_log (service role); PATCH partial updates patient+medical_history; DELETE soft-erases via consents.withdrawn_at + audit_log; `tsc --noEmit` passes
- [x] **B4 — Appointment API** | Files: src/app/api/appointments/route.ts, src/app/api/appointments/[id]/route.ts | Done 2026-05-30: GET filters by ?date/?dentist_id/?chair_id with IST day-range; POST validates VEDA hours (IST) + catches 23P01 chair-overlap as 409; PATCH status+notes with enum check; DELETE soft-cancels; `tsc --noEmit` passes
- [x] **B5 — Clinical APIs** | Files: odontogram/{patientId}/route.ts, odontogram/{patientId}/{toothFdi}/route.ts, notes/route.ts, notes/{patientId}/route.ts, treatment-plans/route.ts, treatment-plans/{id}/route.ts, prescriptions/route.ts, prescriptions/{patientId}/route.ts, attachments/route.ts, attachments/{id}/route.ts | Done 2026-05-30: odontogram GET all + PUT upsert with onConflict; notes POST+GET; treatment-plans POST with procedures + PATCH upsert; prescriptions POST+GET; attachments upload to clinical-files bucket + 1hr signed URL; `tsc --noEmit` passes
- [x] **B6 — Billing API** | Files: invoices/route.ts, invoices/{id}/route.ts, invoices/{id}/payments/route.ts, invoices/{id}/pdf/route.ts | Done 2026-05-30: GET list with ?status= + outstanding_total computed per-invoice; POST creates invoice+lines (GST_DEFAULT_RATE fallback); PATCH invoice status; POST payment recalculates status (0.005 float tolerance); /pdf returns InvoicePDFProps-shaped JSON; `tsc --noEmit` passes
- [x] **B7 — Seed Data** | Files: supabase/seed.sql | Done 2026-05-30: 1 Admin + 3 Dentists (auth.users ON CONFLICT DO NOTHING + explicit profiles upsert); 20 Telugu-named patients (10 ABHA, 5 with allergies, te/en mix); 12 appointments Mon–Sat + 1 Sunday morning (IST-correct UTC times, no overlaps); 5 invoices (2 Paid, 1 Partially Paid, 2 Draft) with lines + payments; pgcrypto crypt() for password hash; all fictional data

### CONNECTIONS Layer

- [x] **N1 — Wire Auth** | Files: src/app/(auth)/login/page.tsx, src/middleware.ts, src/app/api/auth/{login,logout}/route.ts, src/components/layout/TopBar.tsx | Done 2026-05-30: fully wired in B2 — login → signInWithPassword → session cookie; middleware refreshes on every request; TopBar sign-out calls /api/auth/logout + redirect; `tsc --noEmit` passes
- [x] **N2 — Wire Patients** | Files: patients/page.tsx, patients/new/page.tsx, patients/[id]/page.tsx, src/hooks/usePatient.ts | Done 2026-05-30: list debounces 300ms then fetches /api/patients?q=; hasAllergies from medical_histories[0].allergies; new patient POSTs with consent_scopes + comma→array split; detail page uses Supabase server client directly + notFound() for 404; AllergyBanner shows real allergies; usePatient hook implemented; `tsc --noEmit` passes
- [x] **N3 — Wire Appointments** | Files: appointments/page.tsx, appointments/new/page.tsx, appointments/[id]/page.tsx, src/app/api/profiles/route.ts | Done 2026-05-30: scheduler fetches /api/appointments?date=; booking POSTs with IST→UTC conversion + 409 conflict toast; detail page patches status + generates wa.me link with AI fallback; `tsc --noEmit` passes
- [x] **N4 — Wire Odontogram** | Files: src/components/odontogram/OdontogramWrapper.tsx, odontogram/[patientId]/page.tsx | Done 2026-05-30: Server Component fetches tooth_records; OdontogramWrapper (client) fires PUT on tooth change; optimistic update; `tsc --noEmit` passes
- [x] **N5 — Wire Billing** | Files: billing/page.tsx, billing/new/page.tsx, billing/[invoiceId]/page.tsx | Done 2026-05-30: list is async Server Component; new invoice looks up patient by exact phone then POSTs; detail fetches invoice+pdf in parallel; record payment form → POST /payments → refresh; UPI QR + PDF download with real data; `tsc --noEmit` passes
- [x] **N6 — AI Features** | Files: api/ai/draft-reminder/route.ts, api/ai/summarize-note/route.ts, src/app/(app)/notes/[patientId]/page.tsx | Done 2026-05-30: draft-reminder fetches appointment → Anthropic claude-sonnet-4-6 with Telugu/English system prompt → {text, language}; summarize-note fetches note body → SOAP format summary; notes page (new) shows note list + add form + per-note SOAP Summary button with loading state; appointment detail auto-uses real AI text; `tsc --noEmit` passes
- [ ] **N7 — Deploy** | Files: .env.example, vercel.json if needed | Done: live Vercel URL completes full demo loop; URL shareable with client | Prompt: `"Execute Phase N7: verify .env.example lists all vars from docs/ENV.md; set all vars in Vercel Dashboard; run vercel --prod; test full demo loop on live URL: login → dashboard → book appointment → open odontogram → click tooth → create invoice → download PDF → tap wa.me reminder."`

---

## DOING

<!-- Move tasks here when actively in progress. Include owner initials and start date. -->

---

## DONE

<!-- Move tasks here when verified on dev or Vercel. Include completion date. -->
