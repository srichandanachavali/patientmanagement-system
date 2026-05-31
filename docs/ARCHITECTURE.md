<!-- F910 · docs/ARCHITECTURE.md · System layer diagram + data-flow description -->

# VEDA Dental PMS — System Architecture

## Layer Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER (React / Next.js App Router)                           │
│  · Server Components for data-fetching pages                    │
│  · Client Components for odontogram, scheduler, PDF preview     │
│  · Supabase JS client (anon key; RLS enforced at DB layer)      │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTPS (TLS 1.3)
┌───────────────────────▼─────────────────────────────────────────┐
│  VERCEL (Serverless / Node.js runtime)                          │
│  · Next.js 14 App Router host                                   │
│  · API Routes: src/app/api/** (Node.js, not Edge)               │
│  · Middleware: session validation, role-based redirect          │
└──────────┬────────────────────────────┬────────────────────────┘
           │ Supabase SDK               │ Anthropic SDK / Resend SDK
┌──────────▼──────────────┐    ┌────────▼──────────────────────────┐
│  SUPABASE               │    │  EXTERNAL SERVICES                 │
│  · Postgres DB          │    │  · Anthropic API (AI features)     │
│    (RLS on all tables)  │    │  · Resend (transactional email)    │
│  · Auth                 │    │  · Brevo (email fallback)          │
│    (JWT sessions via    │    │  · wa.me deep links                │
│     cookie)             │    │    (WhatsApp — zero API cost)      │
│  · Storage              │    └───────────────────────────────────┘
│    (private buckets;    │
│     signed URLs only)   │
└─────────────────────────┘
```

---

## Data Flow: New Patient Registration

1. Receptionist fills new patient form in browser (Client Component).
2. Form calls POST /api/patients (Next.js API route, server-side).
3. API route uses SUPABASE_SERVICE_ROLE_KEY to insert Patient row (bypasses RLS for admin write).
4. Same transaction inserts Consent row with notice_version, scope, and granted_at (DPDP §6).
5. API route inserts AuditLog row: actor=receptionist, action=CREATE, entity=Patient.
6. Response returns new patient id; browser redirects to /patients/[id].

---

## Data Flow: Clinical Note with AI Summary

1. Dentist writes clinical note in the notes editor (Client Component).
2. Save button calls POST /api/notes → inserts ClinicalNote row in Supabase.
3. "Summarize with AI" button calls POST /api/ai/summarize-note with note_id.
4. API route fetches note body from Supabase, sends to Anthropic API (claude-sonnet model).
5. Anthropic returns structured summary; API route returns it to browser.
6. Summary is displayed inline — Dentist can copy it or dismiss.

---

## Data Flow: Invoice PDF with UPI QR

1. Receptionist clicks "Download Receipt" on a paid invoice.
2. Browser fetches invoice data via GET /api/invoices/[id].
3. @react-pdf/renderer renders the PDF entirely in the browser (no server memory used).
4. UPI QR code is generated client-side from the invoice total and clinic UPI ID.
5. PDF blob is offered as a browser file download.

*Why client-side:* Vercel Hobby serverless functions have a 50 MB memory limit. Server-side PDF generation via puppeteer exceeds this. Client-side avoids the constraint and keeps the Hobby tier free.

---

## Data Flow: WhatsApp Reminder (Phase D)

1. Receptionist clicks "Send Reminder" on an upcoming appointment.
2. POST /api/ai/draft-reminder is called with appointment_id and language ("te" or "en").
3. API route fetches patient name, appointment time, and dentist name from Supabase.
4. Anthropic API drafts a polite reminder message in the requested language.
5. Browser builds a wa.me deep link: `https://wa.me/91{phone}?text={encodedMessage}`.
6. Link opens WhatsApp Web or mobile app; receptionist reviews and taps Send.

*Phase 5 upgrade:* WhatsApp Business API automates step 6 (no manual send required).

---

## Security Posture Summary

- RLS on all Supabase tables — anon key cannot cross patient boundaries.
- SUPABASE_SERVICE_ROLE_KEY is server-only; never in client bundle.
- Attachments served only via server-generated signed URLs (1-hour expiry).
- All traffic HTTPS — Vercel and Supabase enforce this.
- DPDP Act 2023 compliance: consent stored, audit log maintained, erasure path exists.
- See SECURITY.md for full role permission matrix and compliance checklist.

---

## Hosting & Cost Scaling

| Phase | Vercel | Supabase | Monthly Cost |
|-------|--------|----------|-------------|
| Phase D (demo) | Hobby (free) | Free tier | ₹0 |
| Phase 1–4 (live clinic) | Hobby (free) | Free tier (watch storage) | ₹0 |
| Phase 5+ (scale) | Pro (~$20/mo) | Pro (~$25/mo) when storage > 1 GB | ~₹3,700/mo |

Custom domain: ~₹800/year (vedadental.in or similar). Hosting stays free or cheap.
WhatsApp automation (Phase 5): ~₹1 per message via WhatsApp Business API.
