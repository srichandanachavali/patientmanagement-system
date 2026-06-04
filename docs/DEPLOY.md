<!-- F903 · docs/DEPLOY.md · Step-by-step deployment guide + backup + restore -->

# VEDA Dental PMS — Deployment Guide

Stack: Next.js 14 · Prisma · Neon Postgres · Vercel · Vercel Blob  
See `docs/ENV.md` (F906) for how to obtain every environment variable.

---

## Prerequisites

- Node.js 20 LTS installed locally
- GitHub repository created and code pushed to `main`
- Neon account at neon.tech (free tier)
- Vercel account at vercel.com (free Hobby tier is sufficient)
- Git configured with `srichandanachavali` credentials

---

## Stage 1 — Neon Postgres setup

1. Log in to [neon.tech](https://neon.tech).
2. Create a new **Project** named `veda-dental-prod`.
3. From the project dashboard, go to **Connection Details**.
4. Copy the **Connection string** (it looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`).
5. Keep this open — you will paste it into Vercel in Stage 3.

> Neon free tier includes **7-day point-in-time recovery (PITR)**. No extra backup configuration needed.

---

## Stage 2 — Vercel Blob storage setup

1. In the Vercel dashboard, go to **Storage** → **Create Database** → **Blob**.
2. Name the store `veda-dental-attachments`.
3. After creation, click **`.env.local`** to reveal the token value.
4. Copy the `BLOB_READ_WRITE_TOKEN` value — paste it into Vercel in Stage 3.

---

## Stage 3 — Connect repo to Vercel + set environment variables

1. In the Vercel dashboard, click **Add New → Project**.
2. Import your GitHub repo (`veda-dental-pms` or equivalent).
3. Framework preset: **Next.js** (auto-detected).
4. Before deploying, go to **Environment Variables** and add:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `DATABASE_URL` | Neon connection string from Stage 1 | Production |
   | `SESSION_PASSWORD` | 32+ char random string (run `openssl rand -base64 32`) | Production |
   | `BLOB_READ_WRITE_TOKEN` | Token from Stage 2 | Production |
   | `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` (update after first deploy) | Production |

5. Click **Deploy**.

> The build command in `vercel.json` runs `prisma migrate deploy && next build`.
> Prisma generate runs automatically via the `postinstall` script in `package.json`.
> On first deploy this creates all 20 tables in Neon automatically.

---

## Stage 4 — Production seed (run once after first deploy)

After the first deploy succeeds, seed the production database with clinic config and staff accounts:

```bash
# Set DATABASE_URL to the Neon production connection string
export DATABASE_URL="postgresql://..."

# Run the production seed (no demo patients — clinic config + staff accounts only)
npx tsx prisma/seed.production.ts
```

Staff account passwords set during seed should be changed on first login.

---

## Stage 5 — Verify deployment

Run through the Pass/Fail checklist in Stage 7 of the deployment plan. Minimum checks:

| Check | Expected |
|-------|---------|
| `https://your-app.vercel.app/login` loads | Login form with VEDA branding |
| Login with Admin account | Redirects to dashboard |
| Dashboard KPI widgets render | No 500 errors, no "relation does not exist" |
| Create a new patient | Saved, appears in patient list |
| Upload an attachment | File accessible via Vercel Blob CDN URL |
| Create and finalize an invoice | PDF downloadable, status → Issued |
| Odontogram — click a tooth | Focus editor opens, save a status |

---

## Rollback procedure

**Application rollback (no schema change):**
- Vercel dashboard → Deployments → previous deployment → **Promote to Production**

**Application rollback (schema change in the rolled-back deployment):**
1. Promote the previous deployment in Vercel (app code reverts).
2. You cannot auto-rollback a Prisma migration. Options:
   - Write a manual DOWN migration and apply via `npx prisma db execute --file down.sql --url $DATABASE_URL`
   - Or restore from a Neon backup (see below).

---

## Backup & restore — Neon PITR

### What Neon provides automatically
- **7-day point-in-time recovery** on the free tier — no configuration needed.
- Neon continuously archives WAL (write-ahead log), so you can restore to any second within the last 7 days.

### Restore procedure (Neon dashboard)

1. Neon dashboard → your project → **Branches** → main branch → **Restore**.
2. Select **"Restore to a point in time"**.
3. Pick the date and time to restore to (use IST — convert to UTC: IST is UTC+5:30).
4. Click **Restore**. Neon creates a new branch at that point.
5. Update `DATABASE_URL` in Vercel to point to the restored branch.
6. Redeploy to apply.
7. Verify data, then promote the restored branch to main.

### Manual pg_dump backup (additional safety)

Run this whenever before a risky migration:

```bash
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-acl \
  --no-owner \
  --file="veda_backup_$(date +%Y%m%d_%H%M%S).dump"
```

Restore from dump:
```bash
pg_restore \
  --dbname "$DATABASE_URL" \
  --no-acl \
  --no-owner \
  veda_backup_YYYYMMDD_HHMMSS.dump
```

> Store dump files outside the git repo. Never commit `.dump` files.

---

## Updating the app after first deploy

```bash
git push origin main          # triggers Vercel auto-deploy
# If migration changes: Vercel build runs prisma migrate deploy automatically
```

---

## ENV NEEDED (summary)

See `docs/ENV.md` (F906) for the full reference.

| Variable | Required |
|----------|---------|
| `DATABASE_URL` | Yes — Neon Postgres connection string |
| `SESSION_PASSWORD` | Yes — 32+ char random secret |
| `BLOB_READ_WRITE_TOKEN` | Yes (prod) — Vercel Blob token |
| `NEXT_PUBLIC_APP_URL` | Yes (prod) — canonical deployment URL |
