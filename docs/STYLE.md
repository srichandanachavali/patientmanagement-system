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

Animations must not delay perceived load. Prefer CSS transitions over JS animation libraries on data-heavy pages. All odontogram motion is implemented in `src/app/globals.css` with pure CSS keyframes — no animation libraries.

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transition | Fade in (opacity 0 → 1) | 150ms | ease-out |
| Modal / drawer open | Slide up + fade in | 200ms | ease-out |
| Modal / drawer close | Fade out | 150ms | ease-in |
| Odontogram tooth entrance | `veda-tooth-in` — opacity + translateY + scale, staggered by index | 380ms (22–26 ms stagger) | cubic-bezier(0.22, 1, 0.36, 1) |
| Odontogram tooth hover | TranslateY −3 px + scale 1.05 on inner SVG | 220ms | cubic-bezier(0.34, 1.56, 0.64, 1) |
| Odontogram tooth selected | `veda-pulse-ring` — animated 2 px blue ring scaling 1.0 → 1.18 looping | 1.6s loop | cubic-bezier(0.22, 1, 0.36, 1) |
| Odontogram status fill change | Smooth `fill` + `stroke` transition (`veda-tooth-body`) | 280ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Button hover | Background color shift | 100ms | ease-out |
| Allergy banner | No animation — static, always visible at top of patient record | — | — |
| Skeleton loaders | Pulse (opacity 0.5 → 1.0 loop) | 1.2s | ease-in-out |
| Toast notifications | Slide in from top-right | 200ms | ease-out |

**`prefers-reduced-motion`:** All odontogram animations are disabled via a `@media (prefers-reduced-motion: reduce)` rule that strips entrance keyframes, hover scale, and the pulse ring. Status-change colour transitions are also disabled. The chart remains fully functional and visually correct without motion.

**Performance:** Only `transform` and `opacity` are animated to stay on the GPU compositor; no layout thrash on the 32-tooth grid.

---

## Odontogram visual system (F165 / F210)

### Arch-view status rendering (small teeth, ~28–40 px wide)

Each tooth has a glossy enamel base (`linearGradient` white → slight shadow). Status-specific treatments are rendered on top:

| Status | Body fill | Realistic treatment | Glyph / shape |
|--------|-----------|---------------------|---------------|
| Healthy | `#FFFFFF` white ivory | Enamel gloss only | — (clean white) |
| Caries | `#FBBF24` amber | Small dark-brown circle r=2.8 at surface location | `C` hidden when lesion shown |
| Deep Caries | `#F87171` orange-red | Large dark radial blob r=5.5 (black→brown gradient) + black pit r=2.2 | `D` hidden when lesion shown |
| Filled | `#60A5FA` blue | Silver-grey 10×10 amalgam rect + metallic highlight stripe | `F` hidden when patch shown |
| Missing | `#9CA3AF` grey at 26 % opacity | BOLD DARK-RED `#991B1B` solid X (strokeWidth=2.5) | No glyph — X is the marker |
| Crown | `#F5EFE5` porcelain ivory | Enamel gloss + cervical rim line + violet inner ellipse | `◯` ring |
| RCT | `#FCE9EB` pink tint | Canal lines drawn in body-space: 1 canal (incisor/canine), 2 (premolar/molar) | `R` glyph |
| Implant | `#F0F4F0` cool ivory | Metallic grey titanium screw (`linearGradient` silver + V-thread lines) | screw shape |

**Surface-specific lesions (CARIES / DEEP\_CARIES / FILLED):** When a surface is selected, the lesion or patch is offset toward that surface. No surface → crown centre is used.

**Colour-blind safety:** Every status pairs a distinct colour with a unique shape or symbol. The chart is fully usable in protanopia/deuteranopia simulation — never relies on hue alone.

### Focus-view status rendering (large tooth, 240 × 360 px viewBox)

All arch-view treatments are reproduced at ~5× scale with more detail:

| Status | Extra detail in focus view |
|--------|---------------------------|
| Caries | Circle r=13, dark brown `#5C2000` |
| Deep Caries | Radial blob r=34 (black→brown gradient) + black pit r=14 |
| Filled | Amalgam rect fills the selected surface region; metallic highlight stripe |
| Missing | Dark-red X strokes strokeWidth=7 spanning the full body |
| Crown | Porcelain body + 2.5 px rim line + violet inner ellipse strokeWidth=5 |
| RCT | Canal lines strokeWidth=4–5 from cervical to root apex; 3 canals for molars |
| Implant | 36 px wide screw, 7 V-thread sets, shaft metallic highlight stripe |

### Tooth geometry (F210)

Four anatomical SVG path templates per category — incisor (chisel), canine (pointed), premolar (twin-cusp), molar (multi-cusp). Categories are derived from FDI position. Adult and primary share the same paths (primary skips premolar). Upper-arch teeth flip their body vertically via SVG transform so crowns point downward in the chart.

**Curved arch:** Each tooth is translated downward (upper arch) or upward (lower arch) along a parabolic curve `dy = |dist|^1.7 × 22 px` and rotated by `±8° × dist` to fan the back teeth outward.

**Surface highlighting:** When a surface is selected on a tooth, a semi-transparent blue dashed overlay rect is drawn at the anatomical location of that surface (Occlusal/Incisal = top band, Cervical = CEJ band, Mesial/Distal = left/right side strips, Buccal/Lingual = centre face block).

**Numbering toggle:** Both FDI (default) and Universal (1–32 adult, A–T primary) numbering are supported via a toolbar toggle. The system canonical form remains FDI.

**Keyboard navigation:** Arrow keys move focus between teeth (Left/Right across a row, Up/Down between arches), Enter/Space opens the focus editor. Each tooth is a `<button role="gridcell">` with a full ARIA label including FDI number, quadrant, anatomical name, status, findings, and surface.

---

## Click-to-zoom focus editor (F211 / F212)

The cramped side-panel picker has been replaced by a centred hero modal that performs a **shared-element zoom** from the clicked tooth's exact arch position.

| Stage | Animation | Duration | Easing |
|-------|-----------|----------|--------|
| Backdrop fade-in | `opacity 0 → 1` + 6 px backdrop-blur | 320ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Stage open (FLIP zoom) | `transform: origin-rect → translate(-50%,-50%) scale(1)` + `opacity 0.35 → 1` | 380ms | cubic-bezier(0.34, 1.42, 0.64, 1) (slight spring) |
| Stage close (reverse) | `transform → origin-rect` + `opacity → 0.25` | 340ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Surface tap (in focus) | `fill` + `stroke` swap on the clicked surface region | 220ms | ease |
| Status fill apply (in focus) | Body or active-surface `fill` transitions to bright status colour | 280ms | ease |

**Origin capture:** `Tooth.tsx` emits `e.currentTarget.getBoundingClientRect()` on click; this rect is propagated through `AdultChart`/`PediatricChart` → `Odontogram` → `ToothFocusEditor`. The stage's initial CSS `transform` is computed from that rect so the zoom appears to grow OUT of the exact pixel the user tapped, even after the arch's `translateY(...) rotate(...)` placement.

**Two-RAF mount:** The editor mounts in `phase="opening"` with the origin transform inline, then advances to `phase="open"` after `requestAnimationFrame(requestAnimationFrame(...))` so the first paint commits the source position before the CSS transition fires.

**Close path:** `phase="closing"` snaps the inline transform back to the origin rect. The `transitionend` event triggers unmount; a `setTimeout(420ms)` fallback covers `prefers-reduced-motion` where transitions are disabled and the event would otherwise never fire.

**Realistic morphology (F212):** Four category-specific bodies in a shared 240 × 360 viewBox:
- **Incisor** — tall narrow chisel, single tapered root, single labial ridge decoration.
- **Canine** — pointed cusp at the incisal edge, robust crown, cusp-tip ridge.
- **Premolar** — twin-cusp crown, broad single root, two cusp tips + mesio-distal central groove.
- **Molar** — wide square crown with four cusp tips, multi-rooted base, cruciform + transverse occlusal grooves.

Each body's crown is subdivided into 5 individually clickable surface rectangles **clipped to the silhouette** via SVG `clipPath`:
- `B` (Buccal/Labial) — top band of the crown
- `O` / `I` (Occlusal / Incisal) — central region (label switches automatically for anteriors)
- `M` (Mesial) — left strip · `D` (Distal) — right strip
- `L` (Lingual/Palatal) — bottom band
- `C` (Cervical) — separate band at the CEJ

A surface region in its resting state shows a dashed slate outline; when active, it gets the bright status fill and a 2.5 px solid outline in the status's stroke colour. When no surface is selected, the **entire body** receives the status fill so the editor mirrors what the small arch tooth shows. Status decorations (MISSING dashed cross, RCT red X, CROWN violet ring, IMPLANT screw + threads + apex) and finding overlays (STAINS, CALCULUS band, GINGIVAL_RECESSION, CERVICAL_ABRASION, CROWDING chevrons) are rendered at large scale in the focus view and remain visible in the small arch view.

**Accessibility:** Each surface is `role="button"` with `aria-pressed` + `aria-label` (`"Buccal surface"`, `"Buccal surface (selected)"`, etc.). The modal is `role="dialog" aria-modal="true"` with the tooth name in the label. **Esc** closes. Focus is captured on the close button on open and returned to the source tooth button on close. **Backdrop click** also closes. **Reduced motion:** the stage snaps directly to the centre rest state and snaps closed — no zoom animation — while remaining fully interactive.

**Performance:** Only `transform`, `opacity`, `fill`, and `stroke` are animated. No layout thrash. The whole feature is ~10 kB gzip on top of the existing odontogram bundle and ships zero new runtime dependencies (pure CSS + inline SVG).
