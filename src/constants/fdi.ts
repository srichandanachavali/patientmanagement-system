// ── F032 · src/constants/fdi.ts
// Purpose: FDI tooth numbering map + ordered arrays for adult/pediatric chart rendering
// In: — | Out: ToothType, Quadrant, ToothMeta, FDI_MAP, ADULT_UPPER, ADULT_LOWER, PRIMARY_UPPER, PRIMARY_LOWER | See: F024, F162, F163, F164, F165
export type ToothType = 'adult' | 'primary'
export type Quadrant = 'upper-right' | 'upper-left' | 'lower-left' | 'lower-right'

export interface ToothMeta {
  fdi: number
  name: string
  type: ToothType
  quadrant: Quadrant
}

// Adult FDI: quadrant 1=upper-right, 2=upper-left, 3=lower-left, 4=lower-right
// Tooth positions 1-8: central incisor → third molar
const ADULT_NAMES = [
  'Central Incisor', 'Lateral Incisor', 'Canine',
  'First Premolar', 'Second Premolar',
  'First Molar', 'Second Molar', 'Third Molar',
]

// Primary FDI: quadrant 5=upper-right, 6=upper-left, 7=lower-left, 8=lower-right
// Positions 1-5: central incisor → second molar
const PRIMARY_NAMES = [
  'Central Incisor', 'Lateral Incisor', 'Canine',
  'First Molar', 'Second Molar',
]

const ADULT_QUADRANTS: Record<number, Quadrant> = {
  1: 'upper-right', 2: 'upper-left', 3: 'lower-left', 4: 'lower-right',
}
const PRIMARY_QUADRANTS: Record<number, Quadrant> = {
  5: 'upper-right', 6: 'upper-left', 7: 'lower-left', 8: 'lower-right',
}

function buildAdult(): Map<number, ToothMeta> {
  const map = new Map<number, ToothMeta>()
  for (let q = 1; q <= 4; q++) {
    for (let p = 1; p <= 8; p++) {
      const fdi = q * 10 + p
      map.set(fdi, {
        fdi,
        name: ADULT_NAMES[p - 1],
        type: 'adult',
        quadrant: ADULT_QUADRANTS[q],
      })
    }
  }
  return map
}

function buildPrimary(): Map<number, ToothMeta> {
  const map = new Map<number, ToothMeta>()
  for (let q = 5; q <= 8; q++) {
    for (let p = 1; p <= 5; p++) {
      const fdi = q * 10 + p
      map.set(fdi, {
        fdi,
        name: PRIMARY_NAMES[p - 1],
        type: 'primary',
        quadrant: PRIMARY_QUADRANTS[q],
      })
    }
  }
  return map
}

export const FDI_MAP: Map<number, ToothMeta> = new Map([
  ...buildAdult(),
  ...buildPrimary(),
])

// Ordered FDI arrays for rendering (right → left across arch, upper then lower)
export const ADULT_UPPER: number[] = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28]
export const ADULT_LOWER: number[] = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38]
export const PRIMARY_UPPER: number[] = [55,54,53,52,51, 61,62,63,64,65]
export const PRIMARY_LOWER: number[] = [85,84,83,82,81, 71,72,73,74,75]
