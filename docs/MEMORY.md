<!-- F901 · docs/MEMORY.md · Architectural decisions log — date / decision / rationale -->

# VEDA Dental PMS — Decision Log

Add a row for every significant architectural or product decision.
Do not delete rows. If a decision is reversed, add a new row explaining the reversal.

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-30 | Use Next.js App Router (not Pages Router) | App Router is the current Next.js standard; supports React Server Components for faster initial loads; aligns with Supabase SSR helper library |
| 2026-05-30 | Use Supabase as the sole backend (Postgres + Auth + Storage) | Eliminates separate auth service and object storage bill; Supabase free tier sufficient for demo; single SDK reduces integration surface |
| 2026-05-30 | Deploy on Vercel Hobby tier for demo phase | Zero cost for the demo sprint; automatic preview URLs for client review; upgrade path to Pro is one click |
| 2026-05-30 | Use FDI notation (not Universal/Palmer) for odontogram | FDI is the international standard used by Indian dental councils; required for future ABHA integration |
| 2026-05-30 | PDF receipts generated client-side via @react-pdf/renderer | Vercel Hobby serverless functions have 50 MB memory limit; server-side PDF generation with puppeteer exceeds this; client-side avoids the constraint |
| 2026-05-30 | WhatsApp reminders via wa.me deep links (not WhatsApp Business API) | WhatsApp Business API requires an approved business account and costs per message; wa.me links are free and sufficient for Phase D demo; API upgrade planned for Phase 5 |
| 2026-05-30 | AI features via Anthropic API (not OpenAI) | Project tooling preference; Claude selected for clinical note summarization and bilingual (Telugu/English) reminder drafting |
| 2026-05-30 | Use Resend as primary email provider with Brevo as fallback | Resend has a generous free tier and excellent Next.js SDK; Brevo retained as fallback for deliverability redundancy |
| 2026-05-30 | DPDP Act 2023 + Rules 2025 as compliance baseline | System stores patient PHI including ABHA numbers; Indian law mandates explicit consent, breach notification within 72 hours, and patient rights (access/correction/erasure) |
| 2026-05-30 | Roles: Admin, Dentist, Assistant, Receptionist (no patient portal in Phase D) | Four roles cover all clinic staff personas; patient self-service portal deferred to Phase 5 to keep demo scope manageable |
| 2026-05-30 | DB.md skipped from /docs; SCHEMA.md covers all 17 entities | A separate DB.md would duplicate SCHEMA.md content without adding value at this project size |
| 2026-05-30 | shadcn/ui for UI component primitives | Pre-built accessible components styled with Tailwind; CLI adds on demand so bundle stays lean; no separate design system to maintain |
| 2026-05-30 | Zod for validation shared across CORE, client forms, and API routes | Single schema prevents double-maintenance of type + validation logic; react-hook-form has native Zod resolver |
| 2026-05-30 | react-hook-form for form management | Minimal re-renders vs controlled inputs; native Zod resolver; required for complex forms like patient intake and invoice creation |
| 2026-05-30 | date-fns for date utilities | Lightweight and tree-shakeable; handles IST timestamps and appointment slot formatting for the scheduler |
| 2026-05-30 | Custom SVG odontogram (no third-party library) | No React library supports FDI + per-surface notation; custom SVG gives full animation control; CSS transitions avoid re-render cost on 32 teeth |
| 2026-05-30 | 4-layer build order: CORE → UI → BACKEND → CONNECTIONS | CORE types defined first so UI builds on stub data (demo-ready before DB); BACKEND implements same contracts; CONNECTIONS phase is pure wiring — no redesign |
| <!-- TBD --> | <!-- TBD --> | <!-- TBD --> |
