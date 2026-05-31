<!-- F903 · docs/DEPLOY.md · Step-by-step deployment guide + ENV NEEDED section -->

# VEDA Dental PMS — Deployment Guide

## Prerequisites
- Node.js 20 LTS installed locally
- Vercel CLI installed (`npm i -g vercel`)
- Supabase project created at supabase.com
- Anthropic API key obtained at console.anthropic.com
- Resend account created and sending domain verified

---

## Deployment Steps

1. Clone the repository to your local machine.
2. Run `npm install` to install all dependencies.
3. Copy `.env.example` to `.env.local` and fill in all values (see ENV.md for where to get each).
4. Run `npx supabase db push` to apply all migrations to the Supabase project.
5. Run `npm run dev` locally and verify the login page loads and auth works.
6. Run `vercel link` to connect the local project to your Vercel account.
7. In the Vercel dashboard, navigate to Project → Settings → Environment Variables and add every variable listed in the ## ENV NEEDED section below.
8. Run `vercel --prod` to deploy the production build.
9. Verify the deployment URL loads the login page without console errors.
10. Log in with the seeded Admin account and confirm the dashboard renders with VEDA branding.
11. Create one test appointment and confirm the wa.me reminder link opens WhatsApp with Telugu text pre-filled.
12. Generate one invoice PDF and confirm it downloads with clinic name, GST line items, and UPI QR code.
13. Share the Vercel URL with the client for demo review.

## Rollback
- In the Vercel dashboard → Deployments, click any previous deployment → Promote to Production.
- No database rollback is required unless a migration was applied; if so, run `npx supabase db revert` for the specific migration file.

## Updating Demo Seed Data
- Edit `supabase/seed.sql` with updated demo records.
- Run `npx supabase db reset` — WARNING: drops and recreates the database. Use in demo environment only, never production.

---

## ENV NEEDED

See `docs/ENV.md` for the full table of how to obtain each value.

| Variable | Required For |
|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase client in browser and server components |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase client in browser (RLS enforced) |
| SUPABASE_SERVICE_ROLE_KEY | Server-side admin operations, migrations, seed scripts |
| ANTHROPIC_API_KEY | AI note summary, bilingual reminders, recall prioritization |
| NEXT_PUBLIC_APP_URL | Canonical URL for auth redirect URIs and OG meta tags |
| NEXTAUTH_SECRET | <!-- TBD: only if next-auth is adopted; may be replaced by Supabase Auth session management --> |
| GST_DEFAULT_RATE | Default GST percentage applied to invoice line items |
| CLINIC_NAME | Displayed in PDF headers, email subjects, browser title |
| RESEND_API_KEY | Transactional email via Resend |
| BREVO_API_KEY | <!-- TBD: fallback email if Resend delivery fails --> |
