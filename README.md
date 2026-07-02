<!-- F006 · README.md · Quick-start guide, login table, Postgres swap instructions -->

# VEDA Dental PMS

Practice management system for **VEDA Super Speciality Dental Clinic**, Vijayawada, Andhra Pradesh.

Runs fully offline — no AI services, no cloud DB, no API keys.

## Quick start

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open <http://localhost:3000> → log in:

| Role         | Email                       | Password        |
| ------------ | --------------------------- | --------------- |
| Admin        | admin@vedadental.in         | `VEDADemo2026!` |
| Dentist      | dr.ramesh@vedadental.in     | `VEDADemo2026!` |
| Dentist      | dr.priya@vedadental.in      | `VEDADemo2026!` |
| Receptionist | reception@vedadental.in     | `VEDADemo2026!` |

## Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 14 (App Router) + TypeScript strict |
| Styling | Tailwind CSS + custom design tokens (clinical white + teal) |
| Database | Prisma ORM + SQLite (`prisma/dev.db`) — zero external DB |
| Auth | iron-session sealed cookies + bcryptjs password hashing |
| PDF | @react-pdf/renderer — client-side, no server upload |
| Charts | Recharts — fully offline, no API keys |
| QR code | `qrcode` package — UPI QR generation |
| WhatsApp | `wa.me` deep links only — no Twilio, no API keys |

## Feature status

| Module | Route | Status |
| ------ | ----- | ------ |
| Auth + roles | `/login` | ✅ Full |
| Dashboard | `/dashboard` | ✅ Full |
| Patients | `/patients` | ✅ Full — list, search, ABHA, allergy banner, attachments |
| Scheduling | `/appointments` | ✅ Full — per-chair, double-booking guard, wa.me reminders |
| Odontogram | `/odontogram/:id` | ✅ Full — FDI adult + pediatric, status history |
| Clinical notes | `/notes/:id` | ✅ Full |
| Billing | `/billing` | ✅ Full — invoices, partial payments, UPI QR, PDF |
| Lab cases | `/lab` | ✅ Full — status progression, dates, cost tracking |
| Recalls | `/recalls` | ✅ Full — 6-month overdue list, one-tap WhatsApp links |
| Analytics | `/analytics` | ✅ Full — revenue, appointments, plans, patients, receivables |
| Settings | `/settings` | ✅ Full — clinic info, hours, GST, branding |
| Audit log | `/audit-log` | ✅ Full — paginated, actor + role, color-coded actions |
| Prescriptions | `/prescriptions/:id` | ⬜ Stub — planned Phase P4 |
| Treatment plans | `/treatment-plans/:id` | ⬜ Stub — planned Phase N5 |

## Role access

| Route | ADMIN | DENTIST | RECEPTIONIST |
| ----- | ----- | ------- | ------------ |
| `/dashboard` | ✅ | ✅ | ✅ |
| `/patients` | ✅ | ✅ | ✅ |
| `/appointments` | ✅ | ✅ | ✅ |
| `/billing` | ✅ | ✅ | ✅ |
| `/lab` | ✅ | ✅ | ✅ |
| `/odontogram` | ✅ | ✅ | — |
| `/notes` | ✅ | ✅ | — |
| `/recalls` | ✅ | ✅ | ✅ |
| `/settings` | ✅ | — | — |
| `/audit-log` | ✅ | — | — |
| `/analytics` | ✅ | — | — |

## Clinic defaults (baked in)

- **Hours:** Mon–Sat 9:30 AM – 9:00 PM; Sun 9:30 AM – 1:00 PM  
- **Currency:** INR (₹) with `en-IN` locale formatting  
- **GST:** 18% default (per-line override supported)  
- **UPI VPA:** `vedadental@upi`  
- **Chairs:** 3 (configurable in Settings)

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Start Next.js dev server on :3000 |
| `npm run build` | Production build (must be zero errors before shipping) |
| `npm run start` | Run production build |
| `npm run type-check` | `tsc --noEmit` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:reset` | Drop DB, re-apply migrations, re-seed |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:studio` | Prisma Studio at <http://localhost:5555> |

## Project structure

```
src/
  app/
    (auth)/login/         ← login page
    (app)/                ← all authenticated pages
      dashboard/
      patients/
      appointments/
      billing/
      lab/
      odontogram/
      notes/
      recalls/
      analytics/
      settings/
      audit-log/
    api/                  ← Next.js API routes (all require session)
  components/
    layout/               ← AppShell, Sidebar, TopBar, NavItem
    dashboard/            ← RevenueWidget, AppointmentsWidget, ReceivablesWidget
    patients/             ← PatientForm, ConsentCapture, AllergyBanner, AttachmentUploader
    billing/              ← InvoiceForm, InvoicePDF, PdfDownloadButton, UpiQrCode, PatientPicker
    odontogram/           ← Odontogram, AdultChart, PediatricChart, Tooth, ToothStatusPicker
    scheduler/            ← DayView, TimeGrid, AppointmentBlock
  lib/
    db.ts                 ← Prisma singleton
    session.ts            ← iron-session helpers
    utils.ts              ← cn, formatCurrency, formatDate, formatTime
  constants/
    clinic.ts             ← Name, phone, GST rate, chair count
    enums.ts              ← Typed enum arrays
    fdi.ts                ← FDI tooth notation map
  middleware.ts           ← Session + role gates
prisma/
  schema.prisma           ← 17-model DB schema
  seed.ts                 ← Demo data seed
  dev.db                  ← SQLite database (committed for demo convenience)
docs/                     ← Architecture, API, schema, tasks, errors docs
```

## Switching to Postgres

In `prisma/schema.prisma`, change:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Set `DATABASE_URL` to your Postgres connection string. Run `prisma migrate deploy`. Application code is unchanged.

## DPDP Act 2023 compliance

- Per-patient consent capture for Clinical / Billing / Reminders scopes.
- Withdrawing consent marks `withdrawnAt` — no hard delete of clinical records.
- Erasing a patient (right to erasure) replaces the name with `[Erased]` and clears PII fields.
- Audit log records who accessed/created/updated which entity and when.

## Last Updated

2026-07-02
