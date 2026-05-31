<!-- F904 · docs/TESTS.md · Manual + automated test checklist (- [ ] format) -->

# VEDA Dental PMS — Test Checklist

Check off items as they are verified. Re-uncheck if a regression is found.
Add new items whenever a new feature is added.

## Authentication
- [ ] Login with valid Admin credentials redirects to /dashboard
- [ ] Login with valid Dentist credentials redirects to /dashboard (dentist view)
- [ ] Login with invalid credentials shows error message, does not redirect
- [ ] Unauthenticated request to /dashboard redirects to /login
- [ ] Receptionist cannot access /analytics route (redirected or 403)
- [ ] Assistant cannot access /settings route (redirected or 403)

## Patient Records
- [ ] New patient form saves all required fields to Supabase
- [ ] Patient with documented allergy displays unmissable red allergy banner at top of record
- [ ] Patient search by name returns correct results
- [ ] Patient search by phone number returns correct results
- [ ] Patient search by ABHA number returns correct results
- [ ] Editing patient record updates Supabase row and shows confirmation
- [ ] Consent capture at registration stores patient_id, notice_version, scope, and granted_at

## Appointments
- [ ] Creating an appointment for Chair 1 at 10am blocks that slot in the scheduler
- [ ] Attempting a second appointment for Chair 1 at 10am shows conflict error
- [ ] Appointment status can be updated from Scheduled → Completed
- [ ] wa.me reminder link opens WhatsApp with pre-filled Telugu message
- [ ] Appointment appears on correct day in day-view calendar
- [ ] Scheduler respects VEDA hours: blocks Sunday slots after 1:00 pm
- [ ] Scheduler blocks all slots outside Mon–Sat 9:30am–9pm

## Odontogram
- [ ] Clicking a tooth on the adult FDI chart opens a status picker
- [ ] Setting a tooth to "Caries" persists after page reload
- [ ] Pediatric FDI chart renders with correct tooth count and numbering (51–85)
- [ ] Surface-level status (Mesial/Distal/Occlusal/Buccal/Lingual) can be recorded on a tooth

## Billing
- [ ] Creating an invoice generates line items with correct GST calculation
- [ ] Partial payment reduces the outstanding balance on the receivables view
- [ ] Invoice PDF downloads and contains clinic name, patient name, GST breakdown, and UPI QR code
- [ ] UPI QR code in PDF encodes the correct payment amount

## Clinical
- [ ] Treatment plan can be created and linked to a patient
- [ ] Procedure line item with cost estimate saves correctly
- [ ] Clinical note saves with correct appointment_id and author_id
- [ ] X-ray upload succeeds and displays via signed URL (not a raw public URL)

## AI Features
- [ ] AI clinical note summary returns a response within 10 seconds
- [ ] AI bilingual reminder draft returns both Telugu and English versions
- [ ] Anthropic API key error is caught and displayed gracefully (no crash or blank screen)

## Compliance
- [ ] AuditLog row is created when a patient record is viewed (Admin can verify in /audit-log)
- [ ] AuditLog row is created when an invoice is issued
- [ ] Patient data export (access right) returns all records for that patient_id only
- [ ] <!-- TBD: Data erasure workflow test once erasure feature is built in Phase 4 -->

## Performance
- [ ] /dashboard loads in under 2 seconds on a standard broadband connection
- [ ] /patients/[id] loads in under 2 seconds
- [ ] Odontogram renders without layout shift on first load

## Lighthouse (see AUDIT.md for score history)
- [ ] Performance score >= 85
- [ ] Accessibility score >= 90
- [ ] Best Practices score >= 90
- [ ] SEO score >= 80
