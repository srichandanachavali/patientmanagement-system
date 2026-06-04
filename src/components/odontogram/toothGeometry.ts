// ── F210 · src/components/odontogram/toothGeometry.ts
// Purpose: Tooth-category derivation, Universal-numbering map, anatomical SVG path definitions per
//          category (small arch + large focus), and curved-arch placement math.
// In: — | Out: ToothCategory, getToothCategory, fdiToUniversal, TOOTH_GEOMETRY, LARGE_TOOTH_GEOMETRY,
//             archPlacement, SurfaceRect, LargeToothGeometry | See: F165, F211, F212, F163, F164

export type ToothCategory = 'incisor' | 'canine' | 'premolar' | 'molar'

/** Derive tooth category from FDI position. Adult (q 1-4) uses 8 positions; primary (q 5-8) uses 5. */
export function getToothCategory(fdi: number): ToothCategory {
  const pos = fdi % 10
  const q   = Math.floor(fdi / 10)
  if (q >= 5) {
    // Primary teeth: positions 1-2 incisor, 3 canine, 4-5 molar (no premolars)
    if (pos <= 2) return 'incisor'
    if (pos === 3) return 'canine'
    return 'molar'
  }
  // Adult
  if (pos <= 2) return 'incisor'
  if (pos === 3) return 'canine'
  if (pos <= 5) return 'premolar'
  return 'molar'
}

/** FDI → Universal (1–32) for adult teeth. Universal starts at upper-right 3rd molar = 1 and wraps
 *  clockwise (from clinician's view) ending at lower-right 3rd molar = 32. Primary returns null. */
const UNIVERSAL_MAP: Record<number, number> = (() => {
  const m: Record<number, number> = {}
  const ADULT_UPPER = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28]
  const ADULT_LOWER = [38,37,36,35,34,33,32,31, 41,42,43,44,45,46,47,48]
  ADULT_UPPER.forEach((fdi, i) => { m[fdi] = i + 1 })
  ADULT_LOWER.forEach((fdi, i) => { m[fdi] = i + 17 })
  return m
})()

const PRIMARY_LETTER_MAP: Record<number, string> = (() => {
  const m: Record<number, string> = {}
  // Universal primary: A–T. A=55 ... J=65 (upper, R→L), K=75 ... T=85 (lower, L→R)
  // ADA mapping: A=upper-right 2nd molar (=55), traverse to J=upper-left 2nd molar (=65),
  // K=lower-left 2nd molar (=75), traverse to T=lower-right 2nd molar (=85).
  const UPPER = [55,54,53,52,51, 61,62,63,64,65]
  const LOWER = [75,74,73,72,71, 81,82,83,84,85]
  UPPER.forEach((fdi, i) => { m[fdi] = String.fromCharCode(65 + i) })       // A-J
  LOWER.forEach((fdi, i) => { m[fdi] = String.fromCharCode(75 + i) })       // K-T
  return m
})()

export function fdiToUniversal(fdi: number): string {
  if (fdi >= 11 && fdi <= 48) return String(UNIVERSAL_MAP[fdi] ?? fdi)
  return PRIMARY_LETTER_MAP[fdi] ?? String(fdi)
}

// ── Anatomical SVG paths per category ────────────────────────────────────────────────────────
// All paths drawn in a common viewBox with crown at TOP of the SVG (incisal/occlusal up,
// root/cervical at bottom). The Tooth component flips for upper-arch teeth via SVG transform.
// Width and height tuned so that adjacent teeth in an arch row pack neatly.

export interface ToothGeometry {
  /** SVG viewBox width  */ w: number
  /** SVG viewBox height */ h: number
  /** Crown body path d  */ bodyPath: string
  /** Approximate y of cemento-enamel junction (cervical line) for surface region drawing */
  cejY: number
}

export const TOOTH_GEOMETRY: Record<ToothCategory, ToothGeometry> = {
  // Incisor: chisel crown, narrow root
  incisor: {
    w: 28, h: 52, cejY: 22,
    bodyPath:
      'M 8 3 ' +
      'Q 5 3 5 8 ' +
      'L 5 20 ' +
      'L 7 22 ' +
      'L 7 44 ' +
      'Q 7 49 12 49 ' +
      'L 16 49 ' +
      'Q 21 49 21 44 ' +
      'L 21 22 ' +
      'L 23 20 ' +
      'L 23 8 ' +
      'Q 23 3 20 3 ' +
      'Z',
  },
  // Canine: pointed crown cusp, broader cervical, single root
  canine: {
    w: 30, h: 54, cejY: 24,
    bodyPath:
      'M 15 2 ' +
      'L 22 8 ' +
      'L 24 18 ' +
      'L 24 22 ' +
      'L 25 24 ' +
      'L 25 46 ' +
      'Q 25 51 20 51 ' +
      'L 10 51 ' +
      'Q 5 51 5 46 ' +
      'L 5 24 ' +
      'L 6 22 ' +
      'L 6 18 ' +
      'L 8 8 ' +
      'Z',
  },
  // Premolar: rounded twin-cusp crown, single broad root
  premolar: {
    w: 34, h: 50, cejY: 22,
    bodyPath:
      'M 9 4 ' +
      'C 11 2 13 2 14 4 ' +
      'L 17 6 ' +
      'L 20 4 ' +
      'C 21 2 23 2 25 4 ' +
      'C 29 5 29 12 29 12 ' +
      'L 29 20 ' +
      'L 31 22 ' +
      'L 31 44 ' +
      'Q 31 47 27 47 ' +
      'L 7 47 ' +
      'Q 3 47 3 44 ' +
      'L 3 22 ' +
      'L 5 20 ' +
      'L 5 12 ' +
      'C 5 5 9 4 9 4 ' +
      'Z',
  },
  // Molar: wide square crown w/ multiple cusps, broad multi-rooted base
  molar: {
    w: 40, h: 48, cejY: 22,
    bodyPath:
      'M 7 4 ' +
      'C 9 2 11 2 13 4 ' +
      'L 16 6 ' +
      'L 20 4 ' +
      'L 24 6 ' +
      'L 27 4 ' +
      'C 29 2 31 2 33 4 ' +
      'C 36 5 36 12 36 12 ' +
      'L 36 20 ' +
      'L 38 22 ' +
      'L 38 42 ' +
      'Q 38 45 34 45 ' +
      'L 6 45 ' +
      'Q 2 45 2 42 ' +
      'L 2 22 ' +
      'L 4 20 ' +
      'L 4 12 ' +
      'C 4 5 7 4 7 4 ' +
      'Z',
  },
}

// ── Curved-arch placement ────────────────────────────────────────────────────────────────────
// Returns the per-tooth translate (dx, dy) for a row of N teeth indexed 0..N-1.
// The curve is a shallow parabola — back teeth sit slightly lower (upper arch) or higher (lower).
export interface ArchPlacement { dx: number; dy: number; rotate: number }

export function archPlacement(
  index:    number,
  total:    number,
  isUpper:  boolean,
  depth:    number = 26,   // px drop at the back teeth
): ArchPlacement {
  const half   = (total - 1) / 2
  const dist   = (index - half) / half               // -1..+1
  const dyAbs  = Math.pow(Math.abs(dist), 1.7) * depth
  // Upper arch: back teeth drop DOWN below the front (curve smile-shape when viewed as a 2D row)
  // Lower arch: back teeth rise UP above the front (mirror curve)
  const dy     = isUpper ? dyAbs : -dyAbs
  // Slight outward fan: back teeth angle outward by up to ±8°
  const rotate = dist * 8 * (isUpper ? 1 : -1)
  return { dx: 0, dy, rotate }
}

// ── Large focus-view geometry (F211 / F212) ──────────────────────────────────────────────────
// Used by the click-to-zoom ToothFocusEditor. Each category has:
//   - bodyPath: anatomical silhouette in a 240×360 viewBox (crown + cervical + root)
//   - 5 surface regions (B/O/M/D/L) inside the crown — clipped to body, individually clickable
//   - cervical band (C) at the gumline
//   - decorations: non-interactive cusp/ridge lines drawn over O for realism
// Conventions (matches existing chart-style picker layout):
//   - B (Buccal/Labial) — top band of the crown
//   - O (Occlusal) / I (Incisal) — central region
//   - M (Mesial) — left strip · D (Distal) — right strip
//   - L (Lingual/Palatal) — bottom band
//   - C (Cervical) — horizontal band just below the crown at the CEJ

export interface SurfaceRect { x: number; y: number; w: number; h: number }

export interface LargeToothGeometry {
  /** Common SVG viewBox width  */ w: number
  /** Common SVG viewBox height */ h: number
  /** Tooth silhouette (crown + cervical + root) — drawn crown-UP */
  bodyPath: string
  /** Approx y of the CEJ in the path (where cervical starts) */
  cejY: number
  /** 5 anatomical surfaces inside the crown */
  surfaces: {
    B: SurfaceRect
    O: SurfaceRect
    M: SurfaceRect
    D: SurfaceRect
    L: SurfaceRect
  }
  /** Cervical band (C) — drawn as a separate region, sits at the gumline */
  cervical: SurfaceRect
  /** Decorative cusp/ridge paths drawn on top of the body (no interaction) */
  decorations: string[]
}

const VB_W = 240
const VB_H = 360

export const LARGE_TOOTH_GEOMETRY: Record<ToothCategory, LargeToothGeometry> = {
  // ── Incisor: tall narrow chisel, single tapered root ─────────────────────
  incisor: {
    w: VB_W, h: VB_H, cejY: 205,
    bodyPath:
      'M 78 22 ' +
      'L 162 22 ' +
      'Q 178 22 178 42 ' +
      'L 178 180 ' +
      'L 172 200 ' +
      'L 168 218 ' +
      'L 162 232 ' +
      'L 158 320 ' +
      'L 144 340 ' +
      'L 96 340 ' +
      'L 82 320 ' +
      'L 78 232 ' +
      'L 72 218 ' +
      'L 68 200 ' +
      'L 62 180 ' +
      'L 62 42 ' +
      'Q 62 22 78 22 Z',
    surfaces: {
      B: { x: 70,  y: 28,  w: 100, h: 50 },
      O: { x: 100, y: 86,  w: 40,  h: 90 },
      M: { x: 70,  y: 86,  w: 28,  h: 90 },
      D: { x: 142, y: 86,  w: 28,  h: 90 },
      L: { x: 70,  y: 184, w: 100, h: 20 },
    },
    cervical: { x: 70, y: 208, w: 100, h: 22 },
    decorations: [
      // Subtle vertical labial ridge (mamelon)
      'M 120 30 L 120 72',
    ],
  },

  // ── Canine: pointed cusp at the incisal edge, robust crown ───────────────
  canine: {
    w: VB_W, h: VB_H, cejY: 205,
    bodyPath:
      'M 120 14 ' +
      'L 168 50 ' +
      'L 180 90 ' +
      'L 180 180 ' +
      'L 172 200 ' +
      'L 170 220 ' +
      'L 162 234 ' +
      'L 158 320 ' +
      'L 142 340 ' +
      'L 98 340 ' +
      'L 82 320 ' +
      'L 78 234 ' +
      'L 70 220 ' +
      'L 68 200 ' +
      'L 60 180 ' +
      'L 60 90 ' +
      'L 72 50 ' +
      'Z',
    surfaces: {
      B: { x: 70,  y: 30,  w: 100, h: 56 },
      O: { x: 100, y: 92,  w: 40,  h: 84 },
      M: { x: 70,  y: 92,  w: 28,  h: 84 },
      D: { x: 142, y: 92,  w: 28,  h: 84 },
      L: { x: 70,  y: 184, w: 100, h: 20 },
    },
    cervical: { x: 70, y: 208, w: 100, h: 22 },
    decorations: [
      // Cusp tip ridge from apex down
      'M 120 22 L 120 78',
    ],
  },

  // ── Premolar: rounded twin-cusp crown, broad single root ─────────────────
  premolar: {
    w: VB_W, h: VB_H, cejY: 205,
    bodyPath:
      'M 60 38 ' +
      'C 70 22 92 22 100 38 ' +
      'L 120 50 ' +
      'L 140 38 ' +
      'C 148 22 170 22 180 38 ' +
      'C 190 50 188 80 188 80 ' +
      'L 188 178 ' +
      'L 180 200 ' +
      'L 174 222 ' +
      'L 166 236 ' +
      'L 162 318 ' +
      'L 146 340 ' +
      'L 94 340 ' +
      'L 78 318 ' +
      'L 74 236 ' +
      'L 66 222 ' +
      'L 60 200 ' +
      'L 52 178 ' +
      'L 52 80 ' +
      'C 52 50 52 50 60 38 ' +
      'Z',
    surfaces: {
      B: { x: 60,  y: 38,  w: 120, h: 50 },
      O: { x: 100, y: 96,  w: 40,  h: 80 },
      M: { x: 60,  y: 96,  w: 36,  h: 80 },
      D: { x: 144, y: 96,  w: 36,  h: 80 },
      L: { x: 60,  y: 184, w: 120, h: 20 },
    },
    cervical: { x: 58, y: 208, w: 124, h: 22 },
    decorations: [
      // Two cusp tips
      'M 88 36 L 88 76',
      'M 152 36 L 152 76',
      // Mesio-distal central groove on occlusal
      'M 102 136 L 138 136',
    ],
  },

  // ── Molar: wide square crown, multiple cusps, broad multi-rooted base ────
  molar: {
    w: VB_W, h: VB_H, cejY: 205,
    bodyPath:
      'M 44 42 ' +
      'C 54 24 78 24 86 42 ' +
      'L 102 52 ' +
      'L 120 44 ' +
      'L 138 52 ' +
      'L 154 42 ' +
      'C 162 24 186 24 196 42 ' +
      'C 206 56 204 86 204 86 ' +
      'L 204 178 ' +
      'L 196 200 ' +
      'L 190 222 ' +
      'L 182 236 ' +
      'L 174 312 ' +
      'L 158 340 ' +
      'L 82 340 ' +
      'L 66 312 ' +
      'L 58 236 ' +
      'L 50 222 ' +
      'L 44 200 ' +
      'L 36 178 ' +
      'L 36 86 ' +
      'C 36 56 36 56 44 42 ' +
      'Z',
    surfaces: {
      B: { x: 44,  y: 42,  w: 152, h: 50 },
      O: { x: 92,  y: 100, w: 56,  h: 74 },
      M: { x: 44,  y: 100, w: 44,  h: 74 },
      D: { x: 152, y: 100, w: 44,  h: 74 },
      L: { x: 44,  y: 182, w: 152, h: 22 },
    },
    cervical: { x: 42, y: 208, w: 156, h: 22 },
    decorations: [
      // Four cusp tips
      'M 70 38 L 70 80',
      'M 100 50 L 100 80',
      'M 140 50 L 140 80',
      'M 170 38 L 170 80',
      // Cruciform central + transverse groove (occlusal anatomy)
      'M 120 110 L 120 168',
      'M 96 138 L 144 138',
    ],
  },
}
