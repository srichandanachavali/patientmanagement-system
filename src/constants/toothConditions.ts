// ── F209 · src/constants/toothConditions.ts
// Purpose: Single source of truth — statuses, findings, surfaces. Bold saturated palette + a glyph per
//          status so the chart is colour-blind-safe (never relies on hue alone).
// In: — | Out: PrimaryStatus, ToothFinding, CONDITION_CONFIG, PRIMARY_STATUSES, TOOTH_FINDINGS, SURFACE_CONFIG | See: F024, F031, F165, F166

export type PrimaryStatus =
  | 'HEALTHY' | 'CARIES' | 'DEEP_CARIES' | 'FILLED' | 'MISSING' | 'CROWN' | 'RCT' | 'IMPLANT'

export type ToothFinding =
  | 'CALCULUS' | 'STAINS' | 'CROWDING' | 'GINGIVAL_RECESSION' | 'CERVICAL_ABRASION'

export type ClinicalLevel = 'tooth' | 'gingival' | 'arch'

export interface ConditionMeta {
  label:       string
  level:       ClinicalLevel
  strokeColor: string   // hex — SVG stroke (bold outline)
  fillColor:   string   // hex — SVG body fill (bright)
  glyph:       string   // short text marker rendered inside tooth — color-blind safety
  badgeClass:  string   // Tailwind classes for picker badge
}

export const CONDITION_CONFIG: Record<PrimaryStatus | ToothFinding, ConditionMeta> = {
  // ── Primary statuses — bold, saturated, colour-blind-safe (each pairs colour + glyph) ─────
  HEALTHY:     { label: 'Healthy',     level: 'tooth',    strokeColor: '#10B981', fillColor: '#FFFFFF', glyph: '',  badgeClass: 'bg-emerald-50  text-emerald-800  border-emerald-300' },
  CARIES:      { label: 'Caries',      level: 'tooth',    strokeColor: '#D97706', fillColor: '#FBBF24', glyph: 'C', badgeClass: 'bg-amber-100   text-amber-900    border-amber-400'   },
  DEEP_CARIES: { label: 'Deep Caries', level: 'tooth',    strokeColor: '#B91C1C', fillColor: '#F87171', glyph: 'D', badgeClass: 'bg-red-100     text-red-900      border-red-400'     },
  FILLED:      { label: 'Filled',      level: 'tooth',    strokeColor: '#1D4ED8', fillColor: '#60A5FA', glyph: 'F', badgeClass: 'bg-blue-100    text-blue-900     border-blue-400'    },
  MISSING:     { label: 'Missing',     level: 'tooth',    strokeColor: '#374151', fillColor: '#9CA3AF', glyph: '✕', badgeClass: 'bg-gray-200    text-gray-800     border-gray-400'    },
  CROWN:       { label: 'Crown',       level: 'tooth',    strokeColor: '#6D28D9', fillColor: '#A78BFA', glyph: '◯', badgeClass: 'bg-purple-100  text-purple-900   border-purple-400'  },
  RCT:         { label: 'RCT',         level: 'tooth',    strokeColor: '#BE123C', fillColor: '#FB7185', glyph: 'R', badgeClass: 'bg-rose-100    text-rose-900     border-rose-400'    },
  IMPLANT:     { label: 'Implant',     level: 'tooth',    strokeColor: '#0F766E', fillColor: '#14B8A6', glyph: '',  badgeClass: 'bg-teal-100    text-teal-900     border-teal-400'    },

  // ── Findings — overlays, not whole-tooth fills ─────────────────────────────────────────────
  STAINS:             { label: 'Stains',             level: 'tooth',    strokeColor: '#7C2D12', fillColor: '#92400E', glyph: '', badgeClass: 'bg-amber-50  text-amber-800   border-amber-300' },
  CALCULUS:           { label: 'Calculus',           level: 'gingival', strokeColor: '#A16207', fillColor: '#EAB308', glyph: '', badgeClass: 'bg-yellow-100 text-yellow-900  border-yellow-400' },
  GINGIVAL_RECESSION: { label: 'Gingival Recession', level: 'gingival', strokeColor: '#BE185D', fillColor: '#EC4899', glyph: '', badgeClass: 'bg-pink-100   text-pink-900    border-pink-400'   },
  CERVICAL_ABRASION:  { label: 'Cerv. Abrasion',     level: 'tooth',    strokeColor: '#0369A1', fillColor: '#38BDF8', glyph: '', badgeClass: 'bg-sky-100    text-sky-900     border-sky-400'    },
  CROWDING:           { label: 'Crowding',           level: 'arch',     strokeColor: '#6D28D9', fillColor: '#8B5CF6', glyph: '', badgeClass: 'bg-violet-100 text-violet-900  border-violet-400' },
}

export const PRIMARY_STATUSES: PrimaryStatus[] = [
  'HEALTHY', 'CARIES', 'DEEP_CARIES', 'FILLED', 'MISSING', 'CROWN', 'RCT', 'IMPLANT',
]

export const TOOTH_FINDINGS: ToothFinding[] = [
  'STAINS', 'CALCULUS', 'GINGIVAL_RECESSION', 'CERVICAL_ABRASION', 'CROWDING',
]

// Surface display config — full names for the picker UI
export interface SurfaceMeta { code: string; label: string }

export const SURFACE_CONFIG: SurfaceMeta[] = [
  { code: 'M', label: 'Mesial'           },
  { code: 'D', label: 'Distal'           },
  { code: 'O', label: 'Occlusal/Incisal' },
  { code: 'B', label: 'Buccal'           },
  { code: 'L', label: 'Lingual/Palatal'  },
  { code: 'C', label: 'Cervical'         },
]
