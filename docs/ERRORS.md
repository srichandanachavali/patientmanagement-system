<!-- F900 · docs/ERRORS.md · Known error log — error / root cause / fix / timestamp / status -->

# VEDA Dental PMS — Error Log

Add a block here the moment an error is resolved. Never delete blocks.
Format: ERROR / FIX / FILE on consecutive lines within each block.

---

ERROR: Supabase anon key exposed in client bundle via console.log during development
FIX: Remove all console.log statements referencing env vars before any commit; add ESLint rule no-console for production builds
FILE: src/lib/supabase.ts or any file under src/app/api/**

---

ERROR: Next.js Edge runtime incompatible with Supabase Auth helpers when used in middleware
FIX: Set `export const runtime = 'nodejs'` in middleware.ts; do not use Edge runtime for auth-dependent routes
FILE: src/middleware.ts

---

ERROR: PDF generation (invoice receipts) fails silently on Vercel Hobby tier due to 50 MB memory limit on serverless functions
FIX: Use @react-pdf/renderer on the client side instead of a server action; stream the PDF blob to the browser directly
FILE: src/app/billing/[invoiceId]/page.tsx, src/components/InvoicePDF.tsx

---

ERROR: Supabase Storage public URLs expire when bucket policy is set to private
FIX: Generate signed URLs server-side with a 1-hour expiry for X-ray attachments; never expose storage_url directly to the client
FILE: src/app/api/attachments/[id]/route.ts

---

<!-- TBD: Add errors as they occur during Phase D sprint -->
