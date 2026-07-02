# PRD — Product Requirements Document

## App Name
VEDA Super Speciality Dental Clinic — Patient Management System (VEDA Dental PMS)

## Tagline
A full-stack dental practice management system for VEDA Super Speciality Dental Clinic — covering patient records, appointment scheduling, clinical notes, odontogram, billing, prescriptions, lab cases, and DPDP Act compliance.

## Problem
Dental clinics in India still rely on paper registers, WhatsApp messages, and Excel sheets to manage patient records, appointments, and billing. This causes double-bookings, lost medical histories, untracked receivables, and compliance gaps with India's new Digital Personal Data Protection (DPDP) Act. VEDA clinic needed a purpose-built system that works offline-capable, handles bilingual reminders (Telugu and English), generates PDF invoices with UPI QR codes, and maintains a full audit trail.

## Target User
**Primary:** Receptionists and dentists at VEDA Super Speciality Dental Clinic in Guntur. The receptionist registers new patients, schedules appointments, and tracks billing. Dentists update clinical notes, treatment plans, and prescriptions during or after patient visits.  
**Secondary:** Clinic administrator (admin role) who reviews analytics, manages clinic settings (operating hours, GST rates), views the audit log, and manages staff profiles.

## Core Features (Must Have)
- Patient registration with demographics, medical history (conditions, medications, allergies), ABHA number, and consent capture (DPDP Act — 3 scopes: CLINICAL, BILLING, REMINDERS)
- Patient search by name, phone, or ABHA number (300ms debounced)
- Red allergy banner prominently displayed on patient record (WCAG AA 5.9:1 contrast)
- Day-view appointment scheduler with per-chair columns; no-double-booking validation on same chair + overlapping time
- Appointment status flow: Scheduled → Confirmed → Arrived → In-Chair → Completed / No-Show / Cancelled
- Clinical notes linked to appointment (author, body, timestamp)
- Odontogram: FDI notation (adult teeth 11–48; pediatric 51–85 for patients under 12); click-to-zoom tooth focus editor; per-surface status (Caries, Restored, Missing, Crowned, Extracted, Other)
- Treatment plans with procedure list (code, description, cost estimate, status)
- Billing: invoice creation with line items, per-line GST calculation; payment recording (Cash/UPI/Card/Insurance); PDF invoice generation with clinic letterhead via `@react-pdf/renderer`; UPI QR code on invoice detail
- Prescriptions: drug/dosage/frequency/duration list; printable prescription letterhead
- Lab case tracking: Crown/Denture/Implant/Aligner/Other; sent/received/fitted status
- Recall engine: patients whose last visit was > 6 months ago with no future appointment; wa.me WhatsApp reminder links
- Clinic settings: configure operating hours, chair count, GST rates
- Audit log: immutable, paginated log of all CREATE/UPDATE/DELETE/VIEW actions
- Role-based access: Admin, Dentist, Assistant, Receptionist
- Session-based auth with iron-session and bcrypt password hashing
- Bilingual reminder links: Telugu (te) and English (en) per patient preference

## Nice to Have
- AI-powered clinical note summarization (Anthropic API — referenced in SCHEMA.md but not yet active)
- Per-dentist working hours for appointment scheduling
- Email reminders via Resend (route stub exists: `/api/email/send`)
- Patient feedback collection form
- Follow-up task tracking
- Analytics dashboard with revenue and patient flow charts

## Out of Scope
- Patient-facing portal or mobile app
- Integration with insurance claim systems
- National Health Stack (ABHA) real-time API integration (number stored for future use)
- Video consultation

## User Stories
- As a **receptionist**, I want to register a new patient with their medical history and collect their DPDP consent digitally so that I comply with the new privacy law without paper forms.
- As a **dentist**, I want to click on any tooth in the odontogram and set its status (Caries, Restored, etc.) so that I have a visual map of the patient's dental health at every visit.
- As a **receptionist**, I want to create an invoice with procedure line items and see the UPI QR code so that the patient can pay instantly by scanning with their phone.
- As a **dentist**, I want to see the allergy alert banner at the top of every patient record so that I never accidentally prescribe a drug the patient is allergic to.
- As an **admin**, I want to view the audit log and see who performed which actions on which records so that I can maintain accountability and DPDP compliance.
- As a **receptionist**, I want to see the recall list with WhatsApp links so that I can send reminder messages to patients overdue for a check-up with one click.

## Success Metrics
- Zero double-bookings (same chair, same time slot)
- Invoice PDF generation < 3 seconds
- Patient search results returned < 300ms after keystroke (debounced)
- Audit log records every CREATE/UPDATE/DELETE action with actor, entity, and timestamp
- DPDP consent captured for 100% of new patient registrations
- Recall list updated daily showing patients > 6 months without visit
