<!-- F906 · docs/ENV.md · All env vars — name / how to obtain / which file uses each -->

# VEDA Dental PMS — Environment Variables

All production variables must be set in Vercel Dashboard → Project → Settings → Environment Variables.
For local development, copy `.env.example` to `.env.local` and fill in values.
**Never commit `.env.production`, `.env.production.local`, or any file with real secrets.**
The committed `.env` file contains only safe dev defaults (SQLite path + placeholder password).

---

## Variables reference

| Variable | Required | Where to get it | Files that use it |
|----------|----------|-----------------|-------------------|
| `DATABASE_URL` | **PROD + DEV** | Neon dashboard → Project → Connection Details → Connection string (include `?sslmode=require`) | `prisma/schema.prisma`, `src/lib/db.ts` (F010) |
| `SESSION_PASSWORD` | **PROD + DEV** | Generate: `openssl rand -base64 32` — minimum 32 chars | `src/lib/session.ts` (F011) — signs/encrypts the `veda_session` cookie |
| `BLOB_READ_WRITE_TOKEN` | **PROD only** | Vercel dashboard → Storage → Blob → your store → `.env.local` button | `src/app/api/patients/[id]/attachments/route.ts` (F062) — when absent, falls back to `public/uploads/` |
| `NEXT_PUBLIC_APP_URL` | **PROD** | Your Vercel URL e.g. `https://veda-dental.vercel.app` | Future use (OG meta, email links) |

---

## Local development setup

```bash
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL to your Neon dev branch URL
# SESSION_PASSWORD can stay as the placeholder for dev
# BLOB_READ_WRITE_TOKEN is optional — leave blank to use public/uploads/
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Production setup (Vercel)

Set each variable in Vercel Dashboard → Project → Settings → Environment Variables for the **Production** environment:

1. `DATABASE_URL` — Neon production branch connection string with `?sslmode=require`
2. `SESSION_PASSWORD` — 32+ char random string (never reuse the dev default)
3. `BLOB_READ_WRITE_TOKEN` — from Vercel Blob store
4. `NEXT_PUBLIC_APP_URL` — your final domain (e.g. `https://vedadental.in`)

---

## What is NOT needed

- No Supabase keys (replaced by Neon + Prisma)
- No Anthropic/AI keys (no AI features)
- No email service keys (email route is a stub — returns ok without sending)
- No NEXTAUTH_SECRET (using iron-session, not next-auth)
