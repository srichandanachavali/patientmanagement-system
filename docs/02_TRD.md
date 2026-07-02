# TRD — Technical Requirements Document

## Frontend
- Next.js App Router — TypeScript strict mode
- Tailwind CSS — design tokens in `tailwind.config.ts`
- React Hook Form (RHF) + Zod for form validation
- `@react-pdf/renderer` — client-side PDF generation for invoices
- Lucide React — icon set for navigation and UI elements
- `components.json` — shadcn/ui component registry (UI primitives)
- Server Components by default; `"use client"` on interactive components

## Backend
- Next.js API Routes (`route.ts` files in `src/app/api/`)
- Prisma ORM — database access layer with 17 models
- iron-session — session management via `veda_session` cookie
- bcrypt — password hashing
- All API routes protected via `requireSession()` from `src/lib/session.ts`

## Database
- **SQLite** (development) via Prisma with `DATABASE_URL` env var
- **PostgreSQL** (production) via Prisma — swap `DATABASE_URL` to Postgres connection string
- 17 Prisma models: Patient, MedicalHistory, Consent, Appointment, ToothRecord, TreatmentPlan, Procedure, ClinicalNote, Attachment, Invoice, InvoiceLine, Payment, Prescription, LabCase, AuditLog, User, ClinicSettings
- Run migrations: `npm run db:migrate`
- Seed: `npm run db:seed` (development) or `npm run db:seed:production`
- Prisma Studio: `npm run db:studio`

## Authentication
- iron-session with `veda_session` cookie (HTTP-only)
- `veda_role` cookie — stores user role for middleware role gating
- bcrypt password comparison in `POST /api/auth/login`
- `src/middleware.ts` — protects all `/app/*` routes; unauthenticated → redirect to `/login`
- `src/lib/session.ts` — `getSession()` and `requireSession()` helpers

## Hosting
- Vercel (Next.js native deployment)
- PostgreSQL: Supabase Postgres or PlanetScale (swap `DATABASE_URL`)
- Static assets: Vercel CDN
- Patient attachments: `public/uploads/<patientId>/` (local filesystem storage; not cloud in current implementation)

## Third-party APIs & Services
- **Prisma** — ORM and migration tool
- **iron-session** — cookie-based session management
- **@react-pdf/renderer** — PDF generation for invoices
- **Resend** — email API (route stub at `/api/email/send`; not yet wired to external service)
- **WhatsApp wa.me links** — recall reminders (no API; just URL generation)

## Key Libraries
- `prisma` + `@prisma/client`
- `iron-session`
- `bcrypt`
- `@react-pdf/renderer`
- `react-hook-form`
- `zod`
- `lucide-react`
- `next`
- `typescript`
- `tailwindcss`

## Environment Variables
- `DATABASE_URL` — Prisma database connection string (SQLite for dev, Postgres for prod)
- `SESSION_PASSWORD` — iron-session encryption password (min 32 chars)
- `GST_DEFAULT_RATE` — default GST rate for invoice line items (from `src/constants/clinic.ts`)

## Constraints
- Every source file's first comment is a `F{N}` number — unique file identifier used for cross-referencing
- AuditLog rows: INSERT only (no UPDATE or DELETE permitted); INSERT restricted to service_role via RLS
- Patient attachment upload: max 10MB, stored to `public/uploads/<patientId>/`
- Attachment storage URLs: never returned raw; signed URL generated server-side
- Odontogram: pediatric chart (teeth 51–85) auto-selected for patients under 12 (DOB-based)
- FDI notation lookup map in `src/constants/fdi.ts` (11–85 range)
- IST timezone: dashboard uses Indian Standard Time (+5:30) for date math
- Prisma client singleton via `globalThis` for hot-reload safety in development
- `src/middleware.ts` uses `veda_session` + `veda_role` cookies for protection and gating
