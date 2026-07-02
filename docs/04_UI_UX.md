# UI/UX Design Brief

## Aesthetic Direction
Clean, professional healthcare SaaS aesthetic — clinical white backgrounds with structured sidebar navigation. Inspired by Epic Systems and Zoho Health but simplified and modern. Data-dense but organized: every patient detail screen uses clearly delineated sections (demographics / medical history / appointments / billing) with consistent visual hierarchy. The odontogram uses interactive SVG anatomy for dental charting — a visually distinctive feature.

## Color Palette
From `tailwind.config.ts` and `app/globals.css`:
- Background: white (`bg-white`) and light gray (`bg-gray-50` for sidebar/alternating rows)
- Primary accent: likely blue or teal (healthcare conventions — confirm from Tailwind config's custom tokens)
- Danger/allergy: red (`danger-bg`) — allergy banner uses 5.9:1 contrast ratio (WCAG AA)
- Status colors:
  - Scheduled/draft: gray
  - Confirmed: blue
  - Arrived: yellow
  - In-Chair: orange
  - Completed: green
  - No-Show/Cancelled: red/muted
- Text: `text-gray-900` (headings), `text-gray-600` (secondary)
- Sidebar: slightly darker background than main content area

## Typography
- Inter (or system font via Tailwind defaults) — `app/layout.tsx` sets root font
- Headings: semibold/bold
- Body/table: regular weight
- Monospace: for ABHA numbers, invoice IDs, audit log entity IDs

## Component Style
- **AppShell**: sidebar (fixed left, ~240px) + TopBar (fixed top) + scrollable main content area
- **Sidebar NavItem**: icon + label, active state with accent background pill
- **Patient cards** (list): name + phone + allergy badge + language tag
- **Allergy banner**: full-width red strip with warning icon at top of patient detail — cannot be missed
- **StatusBadge**: colored pill for appointment status, invoice status, lab case status
- **Odontogram**: SVG-based anatomical tooth chart; adult (teeth 11–48) or pediatric (51–85); click-to-zoom shared-element focus editor with large anatomical SVG per tooth
- **InvoiceForm**: table of line items with per-row description, amount, GST rate fields
- **InvoicePDF**: `@react-pdf/renderer` template with clinic header, patient details, line item table, totals, UPI QR code
- **UPI QR code** (UpiQrCode.tsx): inline QR generated from `buildUpiLink()` — no external dependency
- **Dashboard widgets**: RevenueWidget, AppointmentsWidget, ReceivablesWidget as metric cards
- **Day-view scheduler**: DayView → TimeGrid (15-min slots) + per-chair columns; AppointmentBlock positioned by time

## Dark / Light Mode
Light mode only — healthcare context requires maximum readability at all times. No dark mode.

## Reference Apps
- Dentrix (dental PMS industry standard)
- Zoho People (clean Indian B2B SaaS aesthetic)
- Linear (sidebar navigation, status badge patterns)

## Key UI Patterns
- **Persistent sidebar** with grouped navigation items (Patients, Scheduling, Clinical, Billing, Lab, Recalls, Admin)
- **TopBar** with page title + user identity chip + sign-out
- **Allergy banner** — unmissable red warning strip at top of patient record
- **Tabbed patient detail** — demographics / clinical / billing / attachments tabs
- **Click-to-zoom odontogram** — shared-element animation from small tooth to large focused SVG with surface click regions
- **Drag-and-drop attachment upload** — with file type and size validation
- **PDF download button** — client-side render via `@react-pdf/renderer`; no server round-trip
- **UPI QR on invoice** — `buildUpiLink()` creates UPI payment deep link encoded as QR
- **wa.me recall links** — clickable WhatsApp message links on recalls page
- **Paginated audit log table** — infinite scroll or page-based pagination

## Mobile Responsiveness
Not a primary design target — intended for desktop use at clinic reception desk and dentist workstation. Tailwind responsive classes used but full mobile optimization is not complete.

## Accessibility
- Allergy banner: WCAG AA 5.9:1 contrast ratio (safety-critical, must pass)
- Semantic HTML (`<main>`, `<nav>`, `<section>`, `<table>`) throughout
- Form labels associated with inputs via RHF
- Focus management in odontogram focus editor (arrow-key navigation between teeth implemented)
- StatusBadge uses color + text label (not color alone)
- No ARIA customizations beyond HTML5 semantics and RHF defaults
