<!-- F908 · docs/AUDIT.md · Lighthouse / a11y audit score history table -->

# VEDA Dental PMS — Lighthouse Audit History

Run Lighthouse in Chrome DevTools (Incognito mode) or via `npx lighthouse <url>` against the Vercel production URL.
Record scores after each major deployment. Re-audit whenever a significant UI change lands.

| Date | URL Tested | Performance | Accessibility | Best Practices | SEO | Failures / Notes |
|------|-----------|-------------|---------------|----------------|-----|-----------------|
| Target | — | >= 85 | >= 90 | >= 90 | >= 80 | — |
| <!-- TBD --> | <!-- TBD: first Vercel deploy URL --> | <!-- TBD --> | <!-- TBD --> | <!-- TBD --> | <!-- TBD --> | First Phase D audit — run before client demo |

## Pages to Audit Regularly

| Page | Why |
|------|-----|
| /dashboard | Most visited; performance baseline |
| /patients/[id] | Data-heavy; odontogram render cost |
| /appointments | Calendar scheduler; render cost |
| /billing/[invoiceId] | PDF generation interaction |

## Known Accessibility Requirements

- Allergy banner must meet WCAG AA color contrast (4.5:1 minimum for normal text)
- All form inputs must have associated `<label>` elements
- Odontogram teeth must have `aria-label` with tooth name and FDI number (e.g. "Upper right central incisor — FDI 11")
- All interactive elements must be keyboard-navigable (Tab order must be logical)
- Modal focus must be trapped while open; restored to trigger element on close
- Telugu text must render correctly (test on Android Chrome which is the dominant browser in AP)
