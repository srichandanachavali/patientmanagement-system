<!-- F906 · docs/ENV.md · All env vars — name / how to obtain / which file uses each -->

# VEDA Dental PMS — Environment Variables

All variables must be set in Vercel Dashboard → Project → Settings → Environment Variables for production.
For local development, copy `.env.example` to `.env.local` and fill in values.
Never commit `.env.local` to git — it must be in `.gitignore`.

| Name | Where To Get It | Which File Uses It |
|------|-----------------|--------------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase Dashboard → Project → Settings → API → Project URL | src/lib/supabase.ts, all server components using Supabase client |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase Dashboard → Project → Settings → API → anon public key | src/lib/supabase.ts, browser-side Supabase client |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Dashboard → Project → Settings → API → service_role secret key — **KEEP PRIVATE, never expose to browser** | src/app/api/** (server-only), migration scripts, seed scripts |
| ANTHROPIC_API_KEY | console.anthropic.com → API Keys → Create Key | src/app/api/ai/** |
| NEXT_PUBLIC_APP_URL | Your Vercel deployment URL e.g. https://veda-dental.vercel.app or custom domain once set up | src/app/layout.tsx (OG meta tags), Supabase Auth redirect URI config |
| NEXTAUTH_SECRET | Run `openssl rand -base64 32` in terminal to generate | src/app/api/auth/[...nextauth]/route.ts — only if next-auth is adopted instead of Supabase Auth sessions |
| GST_DEFAULT_RATE | Set to `18` for standard GST; confirm with clinic accountant whether dental services qualify for exemption | src/app/billing/**, src/components/InvoicePDF.tsx |
| CLINIC_NAME | Set to `VEDA Super Speciality Dental Clinic` | src/components/PDFHeader.tsx, src/app/layout.tsx |
| RESEND_API_KEY | resend.com → Dashboard → API Keys → Create API Key | src/app/api/email/route.ts |
| BREVO_API_KEY | app.brevo.com → Account → SMTP & API → API Keys — fallback only | src/app/api/email/route.ts (fallback path when Resend fails) |
