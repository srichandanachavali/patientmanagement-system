# Software Requirements Specification
## VEDA Super Speciality Dental Clinic — Practice Management System (VEDA Dental PMS)

**Document ID:** SRS-VEDA-001  
**Version:** 1.0  
**Date:** 2026-06-02  
**Status:** Approved  
**Prepared by:** VEDA Development Team  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Data Requirements](#5-data-requirements)
6. [External Interface Requirements](#6-external-interface-requirements)
7. [Compliance and Legal Requirements](#7-compliance-and-legal-requirements)
8. [Assumptions, Constraints, and Future Scope](#8-assumptions-constraints-and-future-scope)
9. [Requirements Traceability Table](#9-requirements-traceability-table)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the VEDA Dental Practice Management System (VEDA Dental PMS). It is intended for use by the development team, clinic administration, and any auditors reviewing regulatory compliance.

### 1.2 Scope

VEDA Dental PMS is a web-based, fully offline-capable practice management system built for VEDA Super Speciality Dental Clinic. The system manages the complete clinical and administrative lifecycle of a dental practice: patient registration, appointment scheduling, clinical charting (odontogram), treatment planning, clinical notes, billing, prescriptions, lab case tracking, follow-up management, patient feedback, and analytics. The system is designed to be operated by dentists, receptionists, and clinical assistants within the clinic's local network. No external cloud APIs are required for core functionality.

### 1.3 Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| PMS | Practice Management System |
| FDI | Fédération Dentaire Internationale — two-digit tooth notation system |
| DPDP Act | Digital Personal Data Protection Act, 2023 (India) |
| DPDP Rules | Digital Personal Data Protection Rules, 2025 (India) |
| GST | Goods and Services Tax (India) |
| INR | Indian Rupee (₹) |
| UPI | Unified Payments Interface |
| RCT | Root Canal Treatment |
| IST | Indian Standard Time (UTC+5:30) |
| ABHA | Ayushman Bharat Health Account number |
| SRS | Software Requirements Specification |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |

### 1.4 References

- DPDP Act, 2023 — Ministry of Electronics & Information Technology, Government of India
- DPDP Rules, 2025 — Draft Rules published under the DPDP Act
- FDI World Dental Federation — Two-Digit Notation System
- Prisma ORM Documentation — prisma.io
- Next.js 14 App Router Documentation — nextjs.org

### 1.5 Overview

Section 2 describes the product context. Section 3 enumerates functional requirements by module. Section 4 covers non-functional requirements. Section 5 defines data models. Section 6 covers external interface requirements. Section 7 addresses legal compliance. Section 8 lists constraints and future scope. Section 9 provides the traceability table.

---

## 2. Overall Description

### 2.1 Product Perspective

VEDA Dental PMS is a standalone Next.js 14 web application served from a local machine within the clinic's premises. It uses a SQLite database via Prisma ORM. The system does not depend on any external SaaS API for its core operation. All patient data is stored locally. Internet connectivity is only required for optional WhatsApp receipt sharing (via wa.me deep links opened in the browser) and for sending pre-composed messages.

### 2.2 Product Functions

The system provides the following major function groups:

1. **Authentication and Authorization** — Role-based access control for three roles: Doctor, Receptionist, Assistant
2. **Patient Management** — Registration, search, edit, DPDP-compliant consent capture, and soft-erasure
3. **Appointment Scheduling** — Day-view calendar with per-dental-chair columns, double-booking prevention
4. **Clinical Odontogram** — FDI-notation tooth chart with status, surface, and finding recording for adults and pediatric patients
5. **Clinical Notes and Treatment Plans** — SOAP-style notes and multi-phase treatment planning
6. **Billing** — Draft-to-issued invoice lifecycle, GST line items, partial payments, UPI QR code, PDF download, WhatsApp receipt
7. **Prescriptions** — Drug picker with printable letterhead
8. **Lab Cases** — Case tracking with automatic follow-up creation on lab result receipt
9. **Follow-ups** — Scheduled follow-up management with status tracking
10. **Patient Feedback** — Structured satisfaction and clinical feedback collection
11. **Analytics** — Revenue, receivables, appointment, and patient trend reporting
12. **Recall Management** — Automatic identification of patients overdue for recall visits
13. **Settings** — Clinic hours, chair count, GST rate configuration
14. **Audit Log** — Paginated, immutable record of all system mutations

### 2.3 User Classes and Characteristics

| Role | Access Level | Primary Functions |
|------|-------------|------------------|
| Doctor | Full access | Clinical charting, notes, treatment plans, prescriptions, all reports |
| Receptionist | Administrative | Patient registration, appointments, billing, recalls, follow-ups |
| Assistant | Limited clinical | Appointments, lab cases, clinical photo upload, follow-ups |

### 2.4 Operating Environment

- **Runtime:** Node.js 18+ on Windows or Linux
- **Database:** SQLite (via Prisma ORM); production deployments may swap to PostgreSQL
- **Browser:** Modern Chromium-based browser (Chrome 110+, Edge 110+); tablet-compatible
- **Network:** Local area network (LAN); no internet required for core functions
- **Language:** English (primary); Telugu patient-facing fields supported

### 2.5 Design and Implementation Constraints

- All monetary values stored and displayed in Indian Rupees (INR)
- All timestamps stored in UTC; displayed in IST (UTC+5:30)
- Patient data must remain on clinic-premises hardware
- No third-party analytics, telemetry, or tracking scripts
- Zero paid external API dependencies for core functionality

---

## 3. Functional Requirements

### 3.1 Authentication and Authorization

**FR-1.1** The system shall support three user roles: `DOCTOR`, `RECEPTIONIST`, and `ASSISTANT`.

**FR-1.2** The system shall authenticate users via a username and password combination. Passwords shall be stored as bcrypt hashes.

**FR-1.3** The system shall establish a session upon successful login using iron-session with a minimum 32-character `SESSION_PASSWORD`. The session shall persist across browser refreshes.

**FR-1.4** The system shall set a `veda_role` cookie on login so that middleware can gate routes without a database round-trip.

**FR-1.5** The system shall protect all `/app/*` routes by redirecting unauthenticated users to `/login`.

**FR-1.6** The system shall allow users to log out, destroying the session and clearing all session cookies.

**FR-1.7** The system shall record user identity (`actorId`) in the audit log for every create, update, and delete operation.

---

### 3.2 Patient Management

**FR-2.1** The system shall allow registration of a new patient with the following fields: full name, phone number, date of birth, gender, language preference, ABHA number (optional), blood group (optional), known allergies (free text, optional), and medical history (diabetes, hypertension, asthma, heart disease, medications, other — each as a boolean or text field).

**FR-2.2** The system shall require capture of DPDP consent at patient registration time. Three consent scopes must be presented: `CLINICAL` (mandatory), `BILLING` (optional), `REMINDERS` (optional).

**FR-2.3** The system shall not complete patient registration if the `CLINICAL` consent scope is not granted.

**FR-2.4** The system shall display a prominent red allergy alert banner on the patient detail page whenever the patient's allergies field is non-empty.

**FR-2.5** The system shall allow searching patients by name, phone number, or ABHA number. Search results shall update with a debounce of no more than 300 ms after each keystroke.

**FR-2.6** The system shall allow editing of patient demographics and medical history at any time.

**FR-2.7** The system shall support DPDP-compliant soft-erasure: upon erasure request, the patient's name, phone, and ABHA shall be replaced with `[Erased]`. The patient record shall be retained with an `erased_at` timestamp for audit trail purposes.

**FR-2.8** The system shall display each patient's language preference, blood group, and medical history tags on the patient detail page.

**FR-2.9** The system shall support file attachments per patient (X-rays, clinical photos, documents) with a maximum file size of 10 MB per upload.

**FR-2.10** The system shall classify attachments into categories: `XRAY`, `BEFORE`, `AFTER`, `DOCUMENT`, `OTHER`.

**FR-2.11** The system shall display `XRAY`, `BEFORE`, and `AFTER` image attachments in a dedicated clinical photo gallery with a full-screen lightbox and previous/next navigation.

**FR-2.12** The system shall display non-image attachments and attachments categorized as `DOCUMENT` or `OTHER` in a separate document list.

---

### 3.3 Appointment Scheduling

**FR-3.1** The system shall present a day-view calendar with one column per dental chair. The default chair count shall be configurable via Clinic Settings.

**FR-3.2** The system shall allow booking an appointment by selecting date, time slot, chair, patient, and appointment type.

**FR-3.3** The system shall prevent double-booking of a chair at the same time on the same date, returning an error if a conflict is detected.

**FR-3.4** The system shall support the following appointment statuses: `SCHEDULED`, `CONFIRMED`, `ARRIVED`, `IN_PROGRESS`, `COMPLETED`, `NO_SHOW`, `CANCELLED`.

**FR-3.5** The system shall allow the appointment status to be updated from the appointment detail page.

**FR-3.6** The system shall display appointment cards in the day-view calendar grid, positioned according to their start time and duration.

**FR-3.7** The system shall display today's appointment count and completion progress on the dashboard.

---

### 3.4 Clinical Odontogram

**FR-4.1** The system shall display a full-mouth odontogram using FDI two-digit tooth notation. Adult patients shall use teeth 11–48. Patients under 12 years of age shall automatically use the pediatric layout (teeth 51–85).

**FR-4.2** The system shall allow selection of one primary tooth status per tooth from: `HEALTHY`, `CARIES`, `DEEP_CARIES`, `FILLED`, `MISSING`, `CROWN`, `RCT`, `IMPLANT`.

**FR-4.3** The system shall allow recording of zero or more findings per tooth from: `STAINS`, `CALCULUS`, `GINGIVAL_RECESSION`, `CERVICAL_ABRASION`, `CROWDING`. Multiple findings may be selected simultaneously on the same tooth.

**FR-4.4** The system shall allow recording of one optional surface per tooth from: `M` (Mesial), `D` (Distal), `O` (Occlusal/Incisal), `B` (Buccal), `L` (Lingual/Palatal), `C` (Cervical).

**FR-4.5** The system shall render each tooth as a white box with a colored border indicating its primary status, per the following mapping:

| Status | Border Color |
|--------|-------------|
| HEALTHY | Light grey |
| CARIES | Amber/orange |
| DEEP_CARIES | Dark orange |
| FILLED | Blue |
| MISSING | Muted grey |
| CROWN | Violet |
| RCT | Red |
| IMPLANT | Emerald green |

**FR-4.6** The system shall render a distinct SVG symbol inside each tooth box to reinforce the primary status (e.g., screw icon for IMPLANT, red X for RCT, dashed X for MISSING, blue rectangle for FILLED, crown ring for CROWN, amber square for CARIES, larger orange square with dark center for DEEP_CARIES).

**FR-4.7** The system shall render finding overlays on top of the tooth status symbol. Overlays shall be positioned at the anatomically correct location based on arch (upper vs lower):

| Finding | Overlay |
|---------|---------|
| STAINS | Three brown dots in the top-right corner |
| CALCULUS | Solid yellow-brown band at the gingival margin |
| GINGIVAL_RECESSION | Pink dashed line at the gum line |
| CERVICAL_ABRASION | Cyan V-notch at the cervical area |
| CROWDING | Violet inward-pointing arrows at each lateral edge |

**FR-4.8** Gingival-level findings (CALCULUS, GINGIVAL_RECESSION) shall be drawn at the bottom edge for upper-arch teeth and at the top edge for lower-arch teeth, matching anatomical orientation.

**FR-4.9** The system shall display a status picker panel when the user clicks a tooth. The picker shall contain three sections: primary status selector, findings multi-select (grouped by clinical level: tooth / gingival / arch), and surface selector.

**FR-4.10** The system shall save tooth state changes automatically on each selection. No explicit save action shall be required from the user.

**FR-4.11** The system shall store each tooth state update as a new append-only `ToothRecord` row, preserving the full history of changes.

**FR-4.12** The system shall display a legend below the chart showing all 8 primary statuses and all 5 findings with their colors and clinical level labels.

---

### 3.5 Clinical Notes

**FR-5.1** The system shall allow creation of clinical notes per patient. Each note shall support SOAP fields: Subjective, Objective, Assessment, Plan.

**FR-5.2** The system shall record the author and timestamp for each clinical note.

**FR-5.3** Clinical notes shall be immutable after creation to preserve the integrity of the medical record.

---

### 3.6 Treatment Plans

**FR-6.1** The system shall allow creation of treatment plans per patient with multiple phases.

**FR-6.2** Each treatment plan phase shall include a description, estimated cost in INR, and status (Pending, In Progress, Completed).

**FR-6.3** The system shall display all treatment plans for a patient in chronological order.

---

### 3.7 Billing

**FR-7.1** The system shall allow creation of an invoice for a patient with one or more line items. Each line item shall have a description, amount (INR), and GST tax rate (default 18%).

**FR-7.2** All newly created invoices shall have status `DRAFT`. Draft invoices shall not be counted in revenue, outstanding receivables, or analytics.

**FR-7.3** The system shall display a prominent yellow banner on Draft invoices stating that the invoice has not yet been issued.

**FR-7.4** The system shall provide a "Finalize Invoice" action on Draft invoices. Upon finalization, the system shall:
  - Set the invoice status to `SENT`
  - Set `issued_at` to the current date and time
  - Generate a unique invoice number in the format `INV-YYYYMMDD-XXXX`

**FR-7.5** The system shall prevent recording payments against a Draft invoice, returning an appropriate error.

**FR-7.6** Once finalized, invoice line items shall be locked and may not be modified.

**FR-7.7** The system shall support the following invoice statuses: `DRAFT`, `SENT` (Issued), `PARTIALLY_PAID`, `PAID`, `CANCELLED`.

**FR-7.8** The system shall allow recording one or more payments against a finalized invoice. Each payment shall record the amount (INR), payment mode (`CASH`, `UPI`, `CARD`), and timestamp.

**FR-7.9** The system shall automatically update invoice status to `PARTIALLY_PAID` when total payments are less than the invoice total, and to `PAID` when fully settled.

**FR-7.10** The system shall display a UPI QR code for the outstanding balance on finalized invoices. The QR code shall encode the clinic's UPI VPA, payee name, amount, and invoice number per the UPI deep-link specification.

**FR-7.11** The system shall generate a downloadable PDF of the invoice including line items, GST breakdown, payment history, UPI QR code, and clinic details.

**FR-7.12** After recording a payment, the system shall display a "Send Receipt via WhatsApp" button. Clicking this button shall open WhatsApp (via `wa.me` deep link) with a pre-composed message containing the patient name, amount received, payment mode, invoice number, and remaining balance.

**FR-7.13** The billing list page shall display Draft invoices at reduced opacity with an "not yet issued" label. The outstanding balance total shown in the page header shall exclude Draft invoice amounts.

---

### 3.8 Prescriptions

**FR-8.1** The system shall allow creation of prescriptions per patient with one or more drug entries.

**FR-8.2** Each drug entry shall include drug name, dosage, frequency, and duration.

**FR-8.3** The system shall provide a printable prescription view formatted as a clinic letterhead.

---

### 3.9 Lab Cases

**FR-9.1** The system shall allow creation of lab cases per patient with fields: case type, lab name, sent date, and notes.

**FR-9.2** The system shall support the following lab case statuses: Pending, Sent, Received.

**FR-9.3** When a lab case status is updated to `Received`, the system shall automatically create a follow-up for the patient, scheduled for the next calendar day at 10:00 IST, with the reason "Fitting appointment — [case type]".

**FR-9.4** The automatic follow-up created by FR-9.3 shall be created silently in the background. If the follow-up creation fails, the lab case status update shall still succeed.

---

### 3.10 Follow-up Management

**FR-10.1** The system shall allow creation of follow-ups per patient with a scheduled date, reason, and status (`PENDING`, `COMPLETED`, `CANCELLED`).

**FR-10.2** The system shall display all follow-ups for a patient, sorted by scheduled date.

**FR-10.3** The system shall allow updating the status of a follow-up.

---

### 3.11 Patient Feedback

**FR-11.1** The system shall allow recording of post-visit feedback per patient.

**FR-11.2** Feedback shall capture: overall satisfaction rating, clinical experience rating, staff behavior rating, wait time rating, and free-text comments.

**FR-11.3** The system shall display aggregated feedback metrics accessible to clinic administrators.

---

### 3.12 Analytics

**FR-12.1** The system shall provide an analytics dashboard displaying the following metrics:
  - Total revenue for the current day and current month
  - Total outstanding receivables (finalized, unpaid invoices only — excludes DRAFT)
  - Number of open (unpaid) invoices
  - Number of appointments today, this week, and this month
  - No-show rate for the current month
  - New patient registrations this month
  - Revenue trend by day over the last 30 days

**FR-12.2** All revenue and receivables calculations shall exclude invoices with status `DRAFT` or `CANCELLED`.

**FR-12.3** The analytics page shall perform all computations server-side via a single aggregated API call.

---

### 3.13 Recall Management

**FR-13.1** The system shall identify recall candidates: patients whose last appointment was more than 6 months ago and who have no future appointment scheduled.

**FR-13.2** The recall list shall display each candidate's name, phone, and last visit date.

**FR-13.3** Each recall candidate row shall include a WhatsApp deep link to open a pre-composed recall reminder message directly in WhatsApp.

---

### 3.14 Clinic Settings

**FR-14.1** The system shall allow authorized users to configure: clinic name, clinic phone number, number of dental chairs, clinic opening and closing hours per day of the week, and default GST rate.

**FR-14.2** Clinic settings shall have a single persistent record (singleton pattern). Settings are created on first access if not present.

**FR-14.3** Changes to clinic settings shall take effect immediately for subsequent operations.

---

### 3.15 Audit Log

**FR-15.1** The system shall maintain an immutable audit log recording every create, update, and delete operation across all entities.

**FR-15.2** Each audit log entry shall record: actor user ID, action type (`CREATE`, `UPDATE`, `DELETE`), entity type, entity ID, and UTC timestamp.

**FR-15.3** The system shall provide a paginated audit log viewer accessible to authorized users.

**FR-15.4** Audit log entries shall never be deleted or modified, including after a patient's data is soft-erased.

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-1** Patient search results shall appear within 500 ms of the user completing typing (after 300 ms debounce), measured on a machine with a database containing at least 1,000 patient records.

**NFR-2** The dashboard page shall load all nine aggregated metrics in a single request within 2 seconds on local hardware.

**NFR-3** Invoice PDF generation shall complete within 3 seconds on the client side.

**NFR-4** The odontogram page shall render all 32 (or 20) tooth SVGs and load existing records within 1.5 seconds.

### 4.2 Reliability

**NFR-5** The system shall handle database errors gracefully and display user-friendly error messages rather than raw stack traces.

**NFR-6** Auto-save on the odontogram shall retry on network failure and provide visual feedback if a save cannot be completed.

**NFR-7** Failure to create an auto follow-up (FR-9.4) shall not cause the lab case update to fail.

### 4.3 Usability

**NFR-8** The odontogram shall be usable on a 10-inch tablet with touch input. All interactive touch targets shall be at least 44×44 CSS pixels.

**NFR-9** All monetary values displayed in the UI shall use the Indian Rupee symbol (₹) and two decimal places.

**NFR-10** All dates displayed in the UI shall be in `DD MMM YYYY` format in IST unless stated otherwise.

**NFR-11** Color-coded status indicators shall include a text label so that the interface remains usable for users with color-vision deficiency.

### 4.4 Security

**NFR-12** All session cookies shall be `HttpOnly` and `Secure` (in production). Session data shall be encrypted using iron-session with a `SESSION_PASSWORD` of at least 32 characters.

**NFR-13** All API routes that access patient data shall call `requireSession()` and return HTTP 401 if no valid session is present.

**NFR-14** File uploads shall be restricted to a maximum of 10 MB per file.

**NFR-15** Uploaded files shall be stored under a patient-specific subdirectory (`public/uploads/<patientId>/`) to prevent cross-patient file access via guessable paths.

**NFR-16** The system shall not expose raw database IDs in client-facing error messages.

**NFR-17** The system shall not log passwords, session tokens, or personal health information in application logs.

### 4.5 Maintainability

**NFR-18** Every source file shall carry an F-number comment header identifying its number, path, purpose, inputs, outputs, and related files.

**NFR-19** All dental condition metadata (statuses, findings, colors, labels, clinical levels) shall originate from a single source-of-truth configuration file (`src/constants/toothConditions.ts`). No condition metadata shall be duplicated across files.

**NFR-20** The system shall achieve zero TypeScript compilation errors (`tsc --noEmit`) and zero build errors (`next build`) before any release.

### 4.6 Portability

**NFR-21** The database layer shall be abstracted through Prisma ORM so that the SQLite provider can be replaced with PostgreSQL by changing the `DATABASE_URL` environment variable and running `prisma migrate deploy`. No application code changes shall be required for this swap.

**NFR-22** The application shall run on Windows and Linux hosts running Node.js 18 or later.

### 4.7 Scalability

**NFR-23** The system is designed for single-clinic use with up to 10,000 patient records and 100,000 appointment records. Scaling beyond this may require a migration to PostgreSQL (see NFR-21).

---

## 5. Data Requirements

### 5.1 Core Entities

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| User | id, name, email, passwordHash, role | Three roles: DOCTOR, RECEPTIONIST, ASSISTANT |
| Patient | id, name, phone, dob, gender, language, abha, bloodGroup, allergies, erasedAt | Soft-erase via erasedAt |
| MedicalHistory | patientId, diabetes, hypertension, asthma, heartDisease, medications, other | 1:1 with Patient |
| Consent | patientId, scope, grantedAt, version | Scope: CLINICAL, BILLING, REMINDERS |
| Appointment | id, patientId, chairId, startTime, endTime, status, notes | status enum |
| ClinicalNote | id, patientId, authorId, subjective, objective, assessment, plan, createdAt | Immutable after creation |
| TreatmentPlan | id, patientId, phases (JSON), status | Multi-phase JSON structure |
| ToothRecord | id, patientId, toothFdi, status, surface, findings, updatedAt | Append-only history; findings stored as JSON string |
| Invoice | id, patientId, createdById, status, issuedAt, invoiceNumber | DRAFT → SENT → PARTIALLY_PAID → PAID |
| InvoiceLine | id, invoiceId, description, amount, taxRate | Locked after invoice finalized |
| Payment | id, invoiceId, amount, mode, paidAt | mode: CASH, UPI, CARD |
| Prescription | id, patientId, authorId, drugs (JSON), createdAt | Drug list as JSON |
| LabCase | id, patientId, caseType, labName, status, sentAt, receivedAt | Auto follow-up on Received |
| FollowUp | id, patientId, scheduledDate, reason, status, createdById | status: PENDING, COMPLETED, CANCELLED |
| Feedback | id, patientId, overallRating, clinicalRating, staffRating, waitRating, comments | Integer ratings 1–5 |
| ClinicSettings | id (=1), name, phone, chairs, gstRate, hours (JSON) | Singleton |
| AuditLog | id, actorId, action, entity, entityId, createdAt | Immutable |

### 5.2 ToothRecord Data Model

The `findings` field shall be stored as a JSON-encoded string array. Valid values are: `CALCULUS`, `STAINS`, `CROWDING`, `GINGIVAL_RECESSION`, `CERVICAL_ABRASION`. An empty findings array shall be stored as `"[]"`.

The `surface` field shall accept one of: `M`, `D`, `O`, `B`, `L`, `C`, or `null` if no surface is specified.

The `status` field shall accept one of: `HEALTHY`, `CARIES`, `DEEP_CARIES`, `FILLED`, `MISSING`, `CROWN`, `RCT`, `IMPLANT`.

### 5.3 Data Retention

Patient records shall be retained indefinitely unless a soft-erasure request is received (FR-2.7). Audit log entries shall be retained indefinitely and shall never be deleted.

---

## 6. External Interface Requirements

### 6.1 User Interfaces

**UI-1** The application shall use a consistent left-sidebar navigation layout with grouped sections: Patients, Appointments, Clinical, Billing, Admin.

**UI-2** The design system shall use Tailwind CSS with the Inter typeface. Semantic color tokens (`text-danger`, `bg-surface`, `border-border`, `text-primary`, etc.) shall be used throughout the codebase for consistent theming.

**UI-3** The application shall be accessible at a minimum WCAG 2.1 Level AA contrast ratio of 4.5:1 for body text and 3:1 for large text.

**UI-4** The allergy banner (FR-2.4) shall achieve a contrast ratio of at least 5.9:1 against its background.

### 6.2 Hardware Interfaces

**HW-1** The application requires no dedicated hardware beyond a standard PC or server running Node.js 18+. Clinical workstations and tablets shall access the application via a web browser on the clinic's local network.

### 6.3 Software Interfaces

**SW-1** The application shall interface with the local filesystem to store uploaded attachments under `public/uploads/<patientId>/`.

**SW-2** The application shall interface with the SQLite database file at the path specified by `DATABASE_URL` in `.env`.

### 6.4 Communication Interfaces

**COM-1** WhatsApp integration shall be implemented exclusively via `wa.me` deep links opened in a new browser tab. No WhatsApp Business API credentials or external service is required.

**COM-2** UPI payment QR codes shall be generated client-side using the UPI deep-link URL scheme (`upi://pay?...`) encoded as a QR image. No payment gateway integration is required.

**COM-3** PDF generation shall be performed client-side using `@react-pdf/renderer`. No server-side PDF service is required.

---

## 7. Compliance and Legal Requirements

### 7.1 Digital Personal Data Protection Act, 2023 (India)

**CL-1** The system shall collect personal data only after obtaining explicit, informed consent from the data principal (patient) at the point of registration.

**CL-2** Three distinct consent scopes shall be presented: `CLINICAL` (purpose: provision of dental care), `BILLING` (purpose: invoice and payment processing), `REMINDERS` (purpose: appointment and recall reminders). Each scope shall be explained in plain language at the point of consent.

**CL-3** The `CLINICAL` consent scope is mandatory. Patients must grant CLINICAL consent before a record can be created.

**CL-4** The system shall record the consent version (linked to the clinic's published privacy notice version, configurable in `CLINIC_DPDP_VERSION`) and timestamp at the time of consent.

**CL-5** The system shall provide a DPDP-compliant erasure mechanism. Upon an erasure request, the patient's name, phone number, and ABHA number shall be replaced with `[Erased]`. The patient record ID and audit trail shall be preserved.

**CL-6** Personal health data shall not be transmitted to any third party. WhatsApp sharing is limited to payment receipt confirmation and is initiated explicitly by clinic staff — the patient's data is not sent to any server; only a `wa.me` link is opened in the browser.

**CL-7** The system shall maintain a full audit trail of all data access and modifications (FR-15.1–15.4) as required for accountability under the DPDP Act.

### 7.2 Tax Compliance (India — GST)

**CL-8** The system shall support GST calculation on invoice line items. The default GST rate shall be 18%, configurable in Clinic Settings.

**CL-9** Invoice PDFs shall display the subtotal, GST amount, and total separately.

**CL-10** Invoice numbers shall follow a date-based format (INV-YYYYMMDD-XXXX) to support GST return filing.

---

## 8. Assumptions, Constraints, and Future Scope

### 8.1 Assumptions

**AS-1** The clinic operates a single location. Multi-branch deployments are out of scope.

**AS-2** The clinic staff are literate in English. Telugu is supported for patient-preference fields but the system UI is English-only.

**AS-3** The clinic has a stable LAN. The application is not designed for concurrent offline-first use without a network connection.

**AS-4** File storage is local. The `public/uploads/` directory is on the same machine as the Node.js process.

**AS-5** The clinic's UPI VPA (`vedadental@upi`) is configured directly in the application constant `CLINIC_NAME` / `src/constants/clinic.ts`. Changes require an application update.

### 8.2 Constraints

**CON-1** The system uses SQLite for persistence. SQLite does not support true concurrent write access from multiple processes. In high-concurrency production environments, the database must be migrated to PostgreSQL.

**CON-2** PDF generation uses `@react-pdf/renderer` which runs in the browser. PDF generation is not available without JavaScript enabled.

**CON-3** No email or SMS sending is implemented. The email stub endpoint returns `ok` without dispatching any message.

**CON-4** User self-registration is not supported. User accounts must be seeded into the database by an administrator running `npm run db:seed` or via a future admin panel.

**CON-5** The system has no rate limiting on API routes. It is intended for internal LAN use only and must not be exposed to the public internet.

### 8.3 Future Scope (Out of Scope for v1.0)

The following features are identified as future enhancements and are explicitly out of scope for this version:

- Multi-branch / multi-clinic support
- SMS and email notification delivery (currently stubbed)
- Role-based field-level data access restrictions beyond route-level gating
- Native mobile application
- Integration with government health schemes (Ayushman Bharat / ABHA verification API)
- Automated GST return file export (GSTR-1 / GSTR-3B)
- Inventory and stock management
- Doctor-wise revenue splitting for partnership practices
- Video/teledentistry consultation module
- Two-factor authentication (2FA)
- Public patient portal for appointment self-booking

---

## 9. Requirements Traceability Table

| Requirement ID | Description (short) | Implemented In |
|---------------|--------------------|-------------------------------------------------|
| FR-1.1 | Three user roles | F011, F013, F021 |
| FR-1.2 | bcrypt login | F050 |
| FR-1.3 | iron-session | F011, F050 |
| FR-1.4 | veda_role cookie | F050, F013 |
| FR-1.5 | Route protection | F013 |
| FR-1.6 | Logout | F051 |
| FR-1.7 | Audit actor ID | F050–F075, F060–F062 |
| FR-2.1 | Patient registration fields | F060, F146 |
| FR-2.2 | DPDP consent capture | F141, F147, F031 |
| FR-2.3 | CLINICAL consent mandatory | F147, F060 |
| FR-2.4 | Allergy banner | F144, F142 |
| FR-2.5 | Debounced search | F140, F060 |
| FR-2.6 | Edit patient | F143, F149, F061 |
| FR-2.7 | Soft-erasure | F061 |
| FR-2.8 | Patient detail tags | F142 |
| FR-2.9 | File attachments | F062, F148 |
| FR-2.10 | Attachment categories | F031, F062 |
| FR-2.11 | Clinical photo gallery | F208, F142 |
| FR-2.12 | Document list | F142 |
| FR-3.1 | Day-view calendar | F150, F153 |
| FR-3.2 | Book appointment | F151 |
| FR-3.3 | Double-booking prevention | F151 |
| FR-3.4 | Appointment statuses | F023, F190 |
| FR-3.5 | Update appointment status | F152 |
| FR-3.6 | Appointment block in grid | F155, F153 |
| FR-3.7 | Dashboard appointment count | F130, F132 |
| FR-4.1 | FDI chart, adult/pediatric | F161, F163, F164 |
| FR-4.2 | Primary tooth statuses | F165, F166, F209 |
| FR-4.3 | Tooth findings (multi-select) | F165, F166, F209 |
| FR-4.4 | Surface selection | F166, F209 |
| FR-4.5 | Status border colors | F165, F209 |
| FR-4.6 | SVG status symbols | F165 |
| FR-4.7 | Finding overlays | F165 |
| FR-4.8 | Arch-aware overlay position | F165 |
| FR-4.9 | Status picker panel | F166 |
| FR-4.10 | Auto-save | F162 |
| FR-4.11 | Append-only ToothRecord | F002, F081 |
| FR-4.12 | Odontogram legend | F161 |
| FR-5.1–5.3 | Clinical notes | F167 |
| FR-6.1–6.3 | Treatment plans | F168 |
| FR-7.1 | Invoice with line items + GST | F171, F173, F082 |
| FR-7.2 | Draft invoices excluded | F082, F083, F196 |
| FR-7.3 | Draft yellow banner | F172 |
| FR-7.4 | Finalize invoice | F172, F083 |
| FR-7.5 | Block payments on Draft | F084 |
| FR-7.6 | Locked lines after finalize | F083 |
| FR-7.7 | Invoice status enum | F025, F083 |
| FR-7.8 | Record payments | F172, F084 |
| FR-7.9 | Auto status on payment | F084 |
| FR-7.10 | UPI QR code | F176, F172 |
| FR-7.11 | Invoice PDF download | F174, F175 |
| FR-7.12 | WhatsApp receipt | F172 |
| FR-7.13 | Draft dimmed in list | F170 |
| FR-8.1–8.3 | Prescriptions | F180, F181 |
| FR-9.1–9.4 | Lab cases + auto follow-up | F070, F071 |
| FR-10.1–10.3 | Follow-up management | src/app/(app)/follow-ups/ |
| FR-11.1–11.3 | Patient feedback | src/app/(app)/feedback/ |
| FR-12.1–12.3 | Analytics dashboard | F184, F196 |
| FR-13.1–13.3 | Recall management | F183, F072 |
| FR-14.1–14.3 | Clinic settings | F185, F073 |
| FR-15.1–15.4 | Audit log | F186, F074 |
| NFR-1–4 | Performance targets | F060, F130, F175, F162 |
| NFR-12–16 | Security | F011, F013, F062 |
| NFR-19 | Single source of truth | F209, F165, F166, F161 |
| NFR-21 | PostgreSQL portability | F002, F010 |
| CL-1–7 | DPDP Act 2023 compliance | F031, F060, F061, F074, F147 |
| CL-8–10 | GST compliance | F173, F174, F082 |

---

*Document version 1.0 — VEDA Dental PMS — 2026-06-02*
