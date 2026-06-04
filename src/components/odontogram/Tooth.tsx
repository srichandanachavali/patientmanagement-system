'use client'
// ── F165 · src/components/odontogram/Tooth.tsx
// Purpose: Anatomical arch tooth — glossy enamel base, per-status realistic SVG treatment,
//          surface-aware lesion placement, finding overlays, animated hover/select/entrance,
//          keyboard-ready, fully ARIA-labelled, prefers-reduced-motion safe.
// In: fdi, status, findings, surface, isSelected, isUpperArch, displayNumber, entranceDelayMs, onClick
// Out: Tooth | See: F163, F164, F209, F210

import { useMemo } from 'react'
import { CONDITION_CONFIG } from '@/constants/toothConditions'
import type { ToothStatus, ToothFinding, ToothSurface } from '@/types'
import { FDI_MAP } from '@/constants/fdi'
import { TOOTH_GEOMETRY, getToothCategory } from './toothGeometry'

interface ToothProps {
  fdi:              number
  status:           ToothStatus
  findings?:        ToothFinding[]
  surface?:         ToothSurface | null
  isSelected:       boolean
  isUpperArch:      boolean
  displayNumber?:   string
  entranceDelayMs?: number
  /** Fires with the button's bounding rect so the focus editor can zoom from this exact spot (F211). */
  onClick:          (rect: DOMRect) => void
  onKeyNav?:        (e: React.KeyboardEvent) => void
}

// Status-specific body fill for realistic rendering (overrides palette where it matters visually)
function statusBodyFill(status: ToothStatus, fallback: string): string {
  switch (status) {
    case 'HEALTHY':  return '#FFFFFF'
    case 'CROWN':    return '#F5EFE5'  // porcelain ivory
    case 'RCT':      return '#FCE9EB'  // soft pink tint
    case 'IMPLANT':  return '#F0F4F0'  // cool ivory (metallic screw contrasts better)
    default:         return fallback
  }
}

// Lesion center in SCREEN coordinates (body-group is flipped for upper arch)
function lesionCenter(
  surface: ToothSurface | null, W: number, cejY: number, H: number, isUpperArch: boolean,
): { cx: number; cy: number } {
  const crownMid = isUpperArch ? H - cejY / 2       : cejY / 2
  const crownTop = isUpperArch ? H - cejY * 0.15    : cejY * 0.15
  const crownLeft  = { cx: W * 0.27, cy: crownMid }
  const crownRight = { cx: W * 0.73, cy: crownMid }
  switch (surface) {
    case 'O': return { cx: W / 2, cy: crownTop }
    case 'M': return crownLeft
    case 'D': return crownRight
    case 'B': return { cx: W / 2, cy: crownMid - 2 }
    case 'L': return { cx: W / 2, cy: crownMid + 2 }
    case 'C': return { cx: W / 2, cy: isUpperArch ? H - cejY + 3 : cejY - 3 }
    default:  return { cx: W / 2, cy: crownMid }
  }
}

export function Tooth({
  fdi, status, findings = [], surface = null,
  isSelected, isUpperArch,
  displayNumber, entranceDelayMs = 0,
  onClick, onKeyNav,
}: ToothProps) {
  const cfg  = CONDITION_CONFIG[status]
  const cat  = getToothCategory(fdi)
  const geom = TOOTH_GEOMETRY[cat]
  const meta = FDI_MAP.get(fdi)

  const { w: W, h: H, bodyPath, cejY } = geom

  const bodyTransform = isUpperArch ? `translate(0 ${H}) scale(1 -1)` : ''

  const fill        = statusBodyFill(status, cfg.fillColor)
  const stroke      = isSelected ? '#2563EB' : cfg.strokeColor
  const bodyOpacity = status === 'MISSING' ? 0.26 : 1

  const hasFinding = (f: ToothFinding) => findings.includes(f)

  const surfaceRegion = useMemo(() => {
    if (!surface) return null
    const inset = 1.8
    const crownTop    = inset
    const crownBottom = cejY
    switch (surface) {
      case 'O': return { x: inset,          y: crownTop,     w: W - inset * 2, h: 8 }
      case 'C': return { x: inset,          y: cejY - 4,     w: W - inset * 2, h: 8 }
      case 'M': return { x: inset,          y: crownTop + 2, w: 6,             h: crownBottom - crownTop - 2 }
      case 'D': return { x: W - 6 - inset,  y: crownTop + 2, w: 6,             h: crownBottom - crownTop - 2 }
      case 'B': return { x: W / 2 - 6,      y: crownTop + 6, w: 12,            h: crownBottom - crownTop - 10 }
      case 'L': return { x: W / 2 - 6,      y: cejY - 10,   w: 12,            h: 12 }
      default:  return null
    }
  }, [surface, W, H, cejY])

  const findingsText = findings.length
    ? ' + ' + findings.map((f) => CONDITION_CONFIG[f].label).join(', ')
    : ''
  const surfaceText = surface ? ` · surface ${surface}` : ''
  const ariaLabel = `Tooth ${displayNumber ?? fdi}${meta ? `, ${meta.quadrant.replace('-', ' ')} ${meta.name}` : ''}, status: ${cfg.label}${findingsText}${surfaceText}`

  const gY              = isUpperArch ? cejY - 2      : H - cejY + 2
  const cervicalAnchorY = isUpperArch ? cejY + 6      : H - cejY - 6

  const lc = useMemo(
    () => lesionCenter(surface, W, cejY, H, isUpperArch),
    [surface, W, cejY, H, isUpperArch],
  )

  // Unique gradient IDs — include fdi so multiple teeth on page don't collide
  const gEnamel = `en-${fdi}`
  const gDCav   = `dc-${fdi}`
  const gScrew  = `sc-${fdi}`

  return (
    <button
      type="button"
      onClick={(e) => onClick(e.currentTarget.getBoundingClientRect())}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.currentTarget instanceof HTMLButtonElement) {
          e.preventDefault()
          onClick(e.currentTarget.getBoundingClientRect())
          return
        }
        onKeyNav?.(e)
      }}
      data-fdi={fdi}
      role="gridcell"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      tabIndex={0}
      className="veda-tooth-hover veda-tooth-enter group relative flex flex-col items-center gap-[2px] rounded-md p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
      style={{ animationDelay: `${entranceDelayMs}ms` }}
    >
      {isUpperArch && (
        <span className="select-none font-mono text-[9px] leading-none text-muted-foreground tabular-nums">
          {displayNumber ?? fdi}
        </span>
      )}

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="veda-tooth-svg overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Enamel gloss — applied over any status fill as a semi-transparent sheen */}
          <linearGradient id={gEnamel} x1="0.18" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="28%"  stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" />
          </linearGradient>
          {/* Deep-caries cavitation — black core → dark brown edge */}
          <radialGradient id={gDCav} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#000000" stopOpacity="0.95" />
            <stop offset="50%"  stopColor="#3B1A0A" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#7C3100" stopOpacity="0.65" />
          </radialGradient>
          {/* Implant screw — metallic grey side-lit gradient */}
          <linearGradient id={gScrew} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#94A3B8" />
            <stop offset="38%"  stopColor="#E2E8F0" />
            <stop offset="68%"  stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
        </defs>

        {/* Selected pulse ring (drawn behind the body) */}
        {isSelected && (
          <rect
            x={1} y={1}
            width={W - 2} height={H - 2}
            rx={6} ry={6}
            fill="none"
            stroke="#2563EB"
            strokeWidth={2}
            className="veda-selected-ring"
          />
        )}

        {/* ── Body group (flipped for upper arch so crown points down) ─────────── */}
        <g transform={bodyTransform}>
          {/* Subtle drop shadow */}
          <path d={bodyPath} fill="rgba(15,23,42,0.08)" transform="translate(0 1.5)" />

          {/* Main body */}
          <path
            d={bodyPath}
            fill={fill}
            fillOpacity={bodyOpacity}
            stroke={stroke}
            strokeWidth={status === 'HEALTHY' ? 1.5 : 2}
            strokeLinejoin="round"
            className="veda-tooth-body"
          />

          {/* Enamel gloss highlight (every tooth; skip MISSING ghost) */}
          {status !== 'MISSING' && (
            <path d={bodyPath} fill={`url(#${gEnamel})`} style={{ pointerEvents: 'none' }} />
          )}

          {/* CEJ guide line */}
          <line
            x1={3} x2={W - 3}
            y1={cejY} y2={cejY}
            stroke="rgba(0,0,0,0.07)"
            strokeWidth={0.8}
          />

          {/* CROWN: porcelain cervical seating rim */}
          {status === 'CROWN' && (
            <line
              x1={3} x2={W - 3}
              y1={cejY - 2} y2={cejY - 2}
              stroke="#B8A898"
              strokeWidth={1.4}
              opacity={0.85}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* RCT: filled canal lines from CEJ to apex (in body-space so they follow the root) */}
          {status === 'RCT' && (cat === 'incisor' || cat === 'canine') && (
            <line
              x1={W / 2} y1={cejY + 3}
              x2={W / 2} y2={H - 5}
              stroke="#9F1239" strokeWidth={1.8} strokeLinecap="round" opacity={0.80}
              style={{ pointerEvents: 'none' }}
            />
          )}
          {status === 'RCT' && (cat === 'premolar' || cat === 'molar') && (
            <>
              <line
                x1={W / 2 - 4} y1={cejY + 3}
                x2={W / 2 - 4} y2={H - 5}
                stroke="#9F1239" strokeWidth={1.5} strokeLinecap="round" opacity={0.80}
                style={{ pointerEvents: 'none' }}
              />
              <line
                x1={W / 2 + 4} y1={cejY + 3}
                x2={W / 2 + 4} y2={H - 5}
                stroke="#9F1239" strokeWidth={1.5} strokeLinecap="round" opacity={0.80}
                style={{ pointerEvents: 'none' }}
              />
            </>
          )}

          {/* Surface region overlay (selected surface shown as blue dashed patch) */}
          {surfaceRegion && (
            <rect
              x={surfaceRegion.x}
              y={surfaceRegion.y}
              width={surfaceRegion.w}
              height={surfaceRegion.h}
              rx={1.5}
              fill="#2563EB"
              fillOpacity={0.30}
              stroke="#2563EB"
              strokeWidth={1}
              strokeDasharray="2 1.5"
            />
          )}
        </g>

        {/* ── STATUS GLYPH (colour-blind safety — screen space, not flipped) ───── */}
        {cfg.glyph && status !== 'IMPLANT' && status !== 'MISSING' && status !== 'RCT' &&
          status !== 'CARIES' && status !== 'DEEP_CARIES' && status !== 'FILLED' && (
          <text
            x={W / 2}
            y={H / 2 + 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
            fill={status === 'HEALTHY' ? cfg.strokeColor : '#0F172A'}
            style={{ pointerEvents: 'none' }}
          >
            {cfg.glyph}
          </text>
        )}

        {/* ── STATUS DECORATIONS (screen space) ──────────────────────────────── */}

        {/* MISSING: ghosted body (handled via bodyOpacity above) + BOLD DARK-RED X */}
        {status === 'MISSING' && (
          <>
            <line x1={5} y1={5} x2={W - 5} y2={H - 5}
              stroke="#991B1B" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={W - 5} y1={5} x2={5} y2={H - 5}
              stroke="#991B1B" strokeWidth={2.5} strokeLinecap="round" />
          </>
        )}

        {/* CARIES: small dark-brown lesion — surface-aware position */}
        {status === 'CARIES' && (
          <circle
            cx={lc.cx} cy={lc.cy}
            r={2.8}
            fill="#5C2000"
            opacity={0.90}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* DEEP CARIES: large dark cavitation with black pit — unmistakably severe */}
        {status === 'DEEP_CARIES' && (
          <>
            <circle cx={lc.cx} cy={lc.cy} r={5.5}
              fill={`url(#${gDCav})`}
              style={{ pointerEvents: 'none' }} />
            <circle cx={lc.cx} cy={lc.cy} r={2.2}
              fill="#000000" opacity={0.90}
              style={{ pointerEvents: 'none' }} />
          </>
        )}

        {/* FILLED: silver amalgam patch — 10×10 px silver rect with metallic highlight */}
        {status === 'FILLED' && (() => {
          const py = isUpperArch ? H - cejY * 0.72 : cejY * 0.72 - 5
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={W / 2 - 5} y={py} width={10} height={10} rx={1.5}
                fill="#94A3B8" stroke="#475569" strokeWidth={0.7} opacity={0.94} />
              <rect x={W / 2 - 3.5} y={py + 1.5} width={3} height={2.5} rx={0.5}
                fill="#E2E8F0" opacity={0.55} />
            </g>
          )
        })()}

        {/* RCT: letter glyph (canal lines are in body group above) */}
        {status === 'RCT' && (
          <text
            x={W / 2}
            y={H / 2 + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
            fill="#9F1239"
            style={{ pointerEvents: 'none' }}
          >
            R
          </text>
        )}

        {/* CROWN: violet inner ring around the crown */}
        {status === 'CROWN' && (
          <ellipse
            cx={W / 2}
            cy={isUpperArch ? H - cejY / 2 - 2 : cejY / 2 + 2}
            rx={W / 2 - 6}
            ry={cejY / 2 - 2}
            fill="none"
            stroke="#6D28D9"
            strokeWidth={1.6}
            opacity={0.60}
          />
        )}

        {/* IMPLANT: grey metallic titanium screw with V-thread lines */}
        {status === 'IMPLANT' && (
          <g transform={`translate(${W / 2 - 5}, ${isUpperArch ? 8 : H - 26})`}
            style={{ pointerEvents: 'none' }}>
            {/* abutment cap */}
            <rect x={1} y={0} width={8} height={3.5} rx={0.8}
              fill={`url(#${gScrew})`} stroke="#475569" strokeWidth={0.6} />
            {/* shaft */}
            <rect x={3} y={3.5} width={4} height={16}
              fill={`url(#${gScrew})`} />
            {/* V-thread lines */}
            {[5, 8, 11, 14, 17].map((ty) => (
              <g key={ty}>
                <line x1={1.5} y1={ty} x2={3}   y2={ty + 1.4} stroke="#475569" strokeWidth={0.8} />
                <line x1={7}   y1={ty} x2={8.5} y2={ty + 1.4} stroke="#475569" strokeWidth={0.8} />
              </g>
            ))}
            {/* apex */}
            <path d="M 3 19.5 L 5 23 L 7 19.5 Z"
              fill={`url(#${gScrew})`} stroke="#475569" strokeWidth={0.5} />
          </g>
        )}

        {/* ── FINDING OVERLAYS (always on top) ───────────────────────────────── */}

        {/* STAINS: dark brown-black irregular stipple */}
        {hasFinding('STAINS') && (
          <>
            <circle cx={W * 0.70} cy={H * 0.25} r={1.9} fill="#2D0E00" opacity={0.88} />
            <circle cx={W * 0.60} cy={H * 0.35} r={1.5} fill="#2D0E00" opacity={0.75} />
            <circle cx={W * 0.78} cy={H * 0.40} r={1.3} fill="#5C2000" opacity={0.72} />
          </>
        )}

        {/* CALCULUS: crusty yellow-brown band at gingival margin */}
        {hasFinding('CALCULUS') && (
          <rect
            x={3} y={gY - 2}
            width={W - 6} height={4}
            rx={1}
            fill="#CA8A04" stroke="#92400E" strokeWidth={0.6}
            opacity={0.88}
          />
        )}

        {/* GINGIVAL_RECESSION: pink dashed line below gingival margin */}
        {hasFinding('GINGIVAL_RECESSION') && (
          <line
            x1={3}     y1={cervicalAnchorY}
            x2={W - 3} y2={cervicalAnchorY}
            stroke="#EC4899" strokeWidth={1.8} strokeDasharray="3 2" strokeLinecap="round"
          />
        )}

        {/* CERVICAL_ABRASION: cyan V-notch at CEJ */}
        {hasFinding('CERVICAL_ABRASION') && (
          <path
            d={isUpperArch
              ? `M ${W/2 - 6} ${cejY + 1} L ${W/2} ${cejY - 5} L ${W/2 + 6} ${cejY + 1}`
              : `M ${W/2 - 6} ${H - cejY - 1} L ${W/2} ${H - cejY + 5} L ${W/2 + 6} ${H - cejY - 1}`}
            fill="none"
            stroke="#0EA5E9" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
          />
        )}

        {/* CROWDING: violet inward chevrons at left/right edges */}
        {hasFinding('CROWDING') && (
          <>
            <polyline
              points={`4,${H/2 - 4} 1.5,${H/2} 4,${H/2 + 4}`}
              fill="none" stroke="#7C3AED" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
            />
            <polyline
              points={`${W - 4},${H/2 - 4} ${W - 1.5},${H/2} ${W - 4},${H/2 + 4}`}
              fill="none" stroke="#7C3AED" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
            />
          </>
        )}
      </svg>

      {!isUpperArch && (
        <span className="select-none font-mono text-[9px] leading-none text-muted-foreground tabular-nums">
          {displayNumber ?? fdi}
        </span>
      )}
    </button>
  )
}
