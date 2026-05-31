<!-- F907 · docs/STYLE.md · Design system: fonts / colors / spacing / animation -->

# VEDA Dental PMS — Visual Design System

Design principle: Clean clinical white. Professional, not sterile. Trustworthy, not corporate.
The FDI odontogram is the signature UI element — it must look polished and interactive.
All screens must load and render in under 2 seconds; animations must not delay perceived load.

---

## Fonts

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Primary UI | Inter | 400, 500, 600 | Via next/font/google; renders cleanly at small sizes on all screens |
| Headings | Inter | 700 | Same family as body; weight alone creates hierarchy |
| Monospace (IDs, codes, FDI numbers) | JetBrains Mono | 400 | For FDI tooth codes, procedure codes, ABHA numbers |
| VEDA brand font | <!-- TBD: check clinic's existing materials --> | — | Replace Inter if clinic supplies a brand font |

---

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| background | #FFFFFF | Page background, card backgrounds |
| surface | #F8F9FB | Sidebar, table alternating rows, form fields |
| border | #E5E7EB | Card borders, dividers, input outlines |
| text-primary | #111827 | Body text, headings |
| text-secondary | #6B7280 | Labels, placeholder text, timestamps |
| accent | <!-- TBD: extract from VEDA brand materials --> | Primary buttons, active nav items, odontogram highlight color |
| accent-hover | <!-- TBD: 10% darker than accent --> | Button hover state |
| success | #16A34A | Payment confirmed badge, appointment completed status |
| warning | #D97706 | Partially paid badge, appointment arriving status |
| danger | #DC2626 | Allergy banner text (MUST be unmissable — verify WCAG AA contrast) |
| danger-bg | #FEF2F2 | Allergy banner background |
| info | #2563EB | Informational badges, hyperlinks |

**Allergy banner requirement:** The danger/danger-bg combination must pass WCAG AA (4.5:1 contrast ratio for normal text). Test at https://webaim.org/resources/contrastchecker/ before finalizing.

---

## Spacing

Uses an 8px base grid. Tailwind's default spacing scale maps cleanly to this.

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Icon padding, tight inline gaps |
| space-2 | 8px | Base unit; input inner padding (vertical) |
| space-3 | 12px | Card inner padding in compact views |
| space-4 | 16px | Standard section padding, button horizontal padding |
| space-6 | 24px | Card padding, form group spacing |
| space-8 | 32px | Section separation |
| space-12 | 48px | Page-level top padding |

Sidebar width: 240px fixed.
Main content max-width: 1280px centered.
Mobile breakpoint: 768px — sidebar collapses to hamburger or bottom nav.

---

## Animation

Animations must not delay perceived load. Prefer CSS transitions over JS animation libraries on data-heavy pages.

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Fade in (opacity 0 → 1) | 150ms | ease-out |
| Modal / drawer open | Slide up + fade in | 200ms | ease-out |
| Modal / drawer close | Fade out | 150ms | ease-in |
| Odontogram tooth hover | Scale 1.0 → 1.05 + drop shadow | 100ms | ease-out |
| Odontogram tooth click | Color fill transition | 150ms | ease-in-out |
| Button hover | Background color shift | 100ms | ease-out |
| Allergy banner | No animation — static, always visible at top of patient record | — | — |
| Skeleton loaders | Pulse (opacity 0.5 → 1.0 loop) | 1.2s | ease-in-out |
| Toast notifications | Slide in from top-right | 200ms | ease-out |

Use CSS transitions (not Framer Motion) for odontogram tooth interactions to avoid React re-render cost on 32+ elements.
Avoid heavy animation on patient list and invoice list pages (data-heavy, performance-sensitive).
