'use client'
// ── F212 · src/components/odontogram/ToothLargeSVG.tsx
// Purpose: Realistic large anatomical tooth for the focus editor — glossy enamel base, per-status SVG
//          treatment (lesions, amalgam, canal lines, porcelain crown, metallic screw), 5 individually
//          clickable surface regions + cervical. Mirrors arch tooth (F165) at 5× scale.
// In: fdi, status, findings, surface, isUpperArch, onSurfaceClick | Out: ToothLargeSVG | See: F165, F209, F210, F211

import { CONDITION_CONFIG } from '@/constants/toothConditions'
import type { ToothStatus, ToothFinding, ToothSurface } from '@/types'
import { LARGE_TOOTH_GEOMETRY, getToothCategory } from './toothGeometry'

interface ToothLargeSVGProps {
  fdi:            number
  status:         ToothStatus
  findings:       ToothFinding[]
  surface:        ToothSurface | null
  isUpperArch:    boolean
  onSurfaceClick: (surface: ToothSurface) => void
}

const SURFACE_LABEL: Record<ToothSurface, string> = {
  B: 'Buccal', O: 'Occlusal', M: 'Mesial', D: 'Distal', L: 'Lingual', C: 'Cervical',
}

// Status-specific body fill for realistic appearance
function statusBodyFill(status: ToothStatus, fallback: string): string {
  switch (status) {
    case 'HEALTHY':  return '#FFFFFF'
    case 'CROWN':    return '#F5EFE5'  // porcelain ivory
    case 'RCT':      return '#FCE9EB'  // pink-tinted
    case 'IMPLANT':  return '#F0F4F0'  // cool ivory (metallic screw contrasts better)
    default:         return fallback
  }
}

// Surface rect lookup — handles 'C' separately from the 5-key surfaces map
type SurfaceMap = { B: { x:number;y:number;w:number;h:number }; O: { x:number;y:number;w:number;h:number }; M: { x:number;y:number;w:number;h:number }; D: { x:number;y:number;w:number;h:number }; L: { x:number;y:number;w:number;h:number } }
type Rect = { x:number; y:number; w:number; h:number }

function getSurfaceRect(
  surface: ToothSurface | null,
  surfaces: SurfaceMap,
  cervical: Rect,
): Rect {
  if (!surface) return surfaces.O
  if (surface === 'C') return cervical
  return surfaces[surface as Exclude<ToothSurface, 'C'>]
}

export function ToothLargeSVG({
  fdi, status, findings, surface, isUpperArch, onSurfaceClick,
}: ToothLargeSVGProps) {
  const cat  = getToothCategory(fdi)
  const geom = LARGE_TOOTH_GEOMETRY[cat]
  const cfg  = CONDITION_CONFIG[status]

  const isAnterior  = cat === 'incisor' || cat === 'canine'
  const oLabelCode: ToothSurface = 'O'
  const oDisplay    = isAnterior ? 'Incisal' : 'Occlusal'

  const { w: W, h: H, bodyPath, surfaces, cervical, decorations, cejY } = geom

  const flipTransform  = isUpperArch ? `translate(0 ${H}) scale(1 -1)` : ''
  const baseBodyFill   = statusBodyFill(status, status === 'HEALTHY' ? '#FFFFFF' : cfg.fillColor)
  const bodyFill       = surface ? '#FDFEFE' : baseBodyFill
  const bodyStroke     = cfg.strokeColor
  const bodyOpacity    = status === 'MISSING' ? 0.26 : 1
  const clipId         = `large-clip-${fdi}`

  // Gradient IDs per tooth so multiple teeth on the page don't collide
  const gEnamel = `lg-en-${fdi}`
  const gDCav   = `lg-dc-${fdi}`
  const gAmalgam = `lg-am-${fdi}`
  const gScrew  = `lg-sc-${fdi}`

  const surfaceFill = (code: ToothSurface) => {
    if (surface === code) return status === 'HEALTHY' ? '#DBEAFE' : cfg.fillColor
    return '#F8FAFC'
  }
  const surfaceStroke = (code: ToothSurface) =>
    surface === code ? cfg.strokeColor : 'rgba(100, 116, 139, 0.55)'

  const hasFinding = (f: ToothFinding) => findings.includes(f)

  // Active surface rect (in body coordinates, same space as flip group)
  const activeSR = getSurfaceRect(surface, surfaces, cervical)
  const activeCenter = { cx: activeSR.x + activeSR.w / 2, cy: activeSR.y + activeSR.h / 2 }

  function SurfaceRegion({ code, rect }: { code: ToothSurface; rect: Rect }) {
    const isActive = surface === code
    return (
      <g className="veda-surface-region" data-active={isActive ? 'true' : 'false'}>
        <rect
          x={rect.x} y={rect.y}
          width={rect.w} height={rect.h}
          rx={4} ry={4}
          fill={surfaceFill(code)}
          stroke={surfaceStroke(code)}
          strokeWidth={isActive ? 2.5 : 1.2}
          strokeDasharray={isActive ? undefined : '4 3'}
          style={{ cursor: 'pointer', transition: 'fill 220ms ease, stroke 220ms ease, stroke-width 180ms ease' }}
          onClick={(e) => { e.stopPropagation(); onSurfaceClick(code) }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSurfaceClick(code) }
          }}
          aria-label={`${SURFACE_LABEL[code]} surface${isActive ? ' (selected)' : ''}`}
          aria-pressed={isActive}
        />
        <text
          x={rect.x + rect.w / 2}
          y={rect.y + rect.h / 2 + 4}
          textAnchor="middle"
          fontSize={code === 'O' ? 14 : 11}
          fontWeight={isActive ? 700 : 500}
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          fill={isActive ? cfg.strokeColor : 'rgba(71, 85, 105, 0.85)'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {code === 'O' && isAnterior ? 'I' : code}
        </text>
      </g>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      className="veda-large-tooth"
      aria-hidden="false"
      aria-label={`Tooth ${fdi} editor — ${oDisplay} surface at centre`}
    >
      <defs>
        {/* Enamel gloss */}
        <linearGradient id={gEnamel} x1="0.15" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.70" />
          <stop offset="25%"  stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" />
        </linearGradient>
        {/* Deep caries radial cavitation — black core → dark brown edge */}
        <radialGradient id={gDCav} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#000000" stopOpacity="0.96" />
          <stop offset="45%"  stopColor="#2D0900" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#7C3100" stopOpacity="0.65" />
        </radialGradient>
        {/* Amalgam fill — silver-grey metallic */}
        <linearGradient id={gAmalgam} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#94A3B8" />
          <stop offset="40%"  stopColor="#E2E8F0" />
          <stop offset="75%"  stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        {/* Implant screw — metallic grey side-lit */}
        <linearGradient id={gScrew} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#94A3B8" />
          <stop offset="38%"  stopColor="#E2E8F0" />
          <stop offset="65%"  stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={bodyPath} transform={flipTransform} />
        </clipPath>
      </defs>

      {/* Drop shadow */}
      <path d={bodyPath} transform={flipTransform} fill="rgba(15,23,42,0.10)" style={{ filter: 'blur(2px)' }} />

      {/* ── Body silhouette ─────────────────────────────────────────────────── */}
      <path
        d={bodyPath}
        transform={flipTransform}
        fill={bodyFill}
        fillOpacity={bodyOpacity}
        stroke={bodyStroke}
        strokeWidth={status === 'HEALTHY' ? 2 : 3}
        strokeLinejoin="round"
        style={{ transition: 'fill 280ms ease, stroke 280ms ease' }}
      />

      {/* ── Clip group: surface regions + lesions + anatomy ─────────────────── */}
      <g clipPath={`url(#${clipId})`} transform={flipTransform}>
        <SurfaceRegion code="B" rect={surfaces.B} />
        <SurfaceRegion code="M" rect={surfaces.M} />
        <SurfaceRegion code={oLabelCode} rect={surfaces.O} />
        <SurfaceRegion code="D" rect={surfaces.D} />
        <SurfaceRegion code="L" rect={surfaces.L} />

        {/* Cervical band (C) */}
        <g className="veda-surface-region" data-active={surface === 'C' ? 'true' : 'false'}>
          <rect
            x={cervical.x} y={cervical.y}
            width={cervical.w} height={cervical.h}
            rx={3}
            fill={surfaceFill('C')}
            stroke={surfaceStroke('C')}
            strokeWidth={surface === 'C' ? 2.5 : 1.2}
            strokeDasharray={surface === 'C' ? undefined : '4 3'}
            style={{ cursor: 'pointer', transition: 'fill 220ms ease, stroke 220ms ease, stroke-width 180ms ease' }}
            onClick={(e) => { e.stopPropagation(); onSurfaceClick('C') }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSurfaceClick('C') }
            }}
            aria-label={`Cervical surface${surface === 'C' ? ' (selected)' : ''}`}
            aria-pressed={surface === 'C'}
          />
          <text
            x={cervical.x + cervical.w / 2}
            y={cervical.y + cervical.h / 2 + 4}
            textAnchor="middle"
            fontSize={11}
            fontWeight={surface === 'C' ? 700 : 500}
            fontFamily="ui-monospace, SFMono-Regular, monospace"
            fill={surface === 'C' ? cfg.strokeColor : 'rgba(71, 85, 105, 0.85)'}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            C
          </text>
        </g>

        {/* Cusp/ridge anatomy decorations */}
        {decorations.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="rgba(71, 85, 105, 0.55)"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
            style={{ pointerEvents: 'none' }}
          />
        ))}

        {/* Enamel gloss overlay (all statuses except MISSING) */}
        {status !== 'MISSING' && (
          <path d={bodyPath} fill={`url(#${gEnamel})`} style={{ pointerEvents: 'none' }} />
        )}

        {/* CROWN: porcelain cervical seating rim */}
        {status === 'CROWN' && (
          <line
            x1={cervical.x} x2={cervical.x + cervical.w}
            y1={cervical.y - 2} y2={cervical.y - 2}
            stroke="#B8A898" strokeWidth={2.5} opacity={0.85}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* RCT: filled canal lines from cervical down the root */}
        {status === 'RCT' && (cat === 'incisor' || cat === 'canine') && (
          <line
            x1={W / 2} y1={cejY + 12}
            x2={W / 2} y2={H - 22}
            stroke="#9F1239" strokeWidth={5} strokeLinecap="round" opacity={0.82}
            style={{ pointerEvents: 'none' }}
          />
        )}
        {status === 'RCT' && cat === 'premolar' && (
          <>
            <line x1={W/2 - 14} y1={cejY + 12} x2={W/2 - 14} y2={H - 22}
              stroke="#9F1239" strokeWidth={4.5} strokeLinecap="round" opacity={0.82}
              style={{ pointerEvents: 'none' }} />
            <line x1={W/2 + 14} y1={cejY + 12} x2={W/2 + 14} y2={H - 22}
              stroke="#9F1239" strokeWidth={4.5} strokeLinecap="round" opacity={0.82}
              style={{ pointerEvents: 'none' }} />
          </>
        )}
        {status === 'RCT' && cat === 'molar' && (
          <>
            <line x1={W/2 - 20} y1={cejY + 12} x2={W/2 - 20} y2={H - 28}
              stroke="#9F1239" strokeWidth={4} strokeLinecap="round" opacity={0.82}
              style={{ pointerEvents: 'none' }} />
            <line x1={W/2}      y1={cejY + 12} x2={W/2}      y2={H - 28}
              stroke="#9F1239" strokeWidth={4} strokeLinecap="round" opacity={0.82}
              style={{ pointerEvents: 'none' }} />
            <line x1={W/2 + 20} y1={cejY + 12} x2={W/2 + 20} y2={H - 28}
              stroke="#9F1239" strokeWidth={4} strokeLinecap="round" opacity={0.82}
              style={{ pointerEvents: 'none' }} />
          </>
        )}

        {/* CARIES: dark-brown lesion at surface center — small, localized */}
        {status === 'CARIES' && (
          <circle
            cx={activeCenter.cx} cy={activeCenter.cy}
            r={13}
            fill="#5C2000"
            opacity={0.88}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* DEEP CARIES: large radial cavitation + black pit — unmistakably more severe */}
        {status === 'DEEP_CARIES' && (
          <>
            <circle cx={activeCenter.cx} cy={activeCenter.cy} r={34}
              fill={`url(#${gDCav})`}
              style={{ pointerEvents: 'none' }} />
            {/* Black central pit for the "hole" illusion */}
            <circle cx={activeCenter.cx} cy={activeCenter.cy} r={14}
              fill="#000000" opacity={0.92}
              style={{ pointerEvents: 'none' }} />
          </>
        )}

        {/* FILLED: silver amalgam patch on active surface (or default O) */}
        {status === 'FILLED' && (() => {
          const sr = activeSR
          return (
            <>
              <rect x={sr.x + 3} y={sr.y + 3} width={sr.w - 6} height={sr.h - 6} rx={4}
                fill={`url(#${gAmalgam})`} stroke="#475569" strokeWidth={2} opacity={0.96}
                style={{ pointerEvents: 'none' }} />
              {/* Metallic highlight stripe */}
              <rect
                x={sr.x + 8} y={sr.y + 8}
                width={Math.max(8, (sr.w - 16) * 0.45)}
                height={Math.max(6, sr.h * 0.28)}
                rx={2}
                fill="#E2E8F0" opacity={0.52}
                style={{ pointerEvents: 'none' }}
              />
            </>
          )
        })()}
      </g>

      {/* ── Status glyph (screen space — colour-blind safety) ─────────────── */}
      {cfg.glyph && status !== 'IMPLANT' && status !== 'MISSING'
        && status !== 'CARIES' && status !== 'DEEP_CARIES' && status !== 'FILLED'
        && !surface && (
        <text
          x={W / 2}
          y={H / 2 + 8}
          textAnchor="middle"
          fontSize={32}
          fontWeight={800}
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          fill={status === 'HEALTHY' ? cfg.strokeColor : '#0F172A'}
          opacity={0.18}
          style={{ pointerEvents: 'none' }}
        >
          {cfg.glyph}
        </text>
      )}

      {/* ── Status decorations (screen space) ─────────────────────────────── */}

      {/* MISSING: bold dark-red X */}
      {status === 'MISSING' && (
        <>
          <line x1={40} y1={40} x2={W - 40} y2={H - 40}
            stroke="#991B1B" strokeWidth={7} strokeLinecap="round" />
          <line x1={W - 40} y1={40} x2={40} y2={H - 40}
            stroke="#991B1B" strokeWidth={7} strokeLinecap="round" />
        </>
      )}

      {/* CROWN: violet inner ring */}
      {status === 'CROWN' && (
        <g transform={flipTransform} clipPath={`url(#${clipId})`}>
          <ellipse
            cx={W / 2}
            cy={geom.cejY / 2 + 30}
            rx={W / 2 - 50}
            ry={geom.cejY / 2 - 20}
            fill="none"
            stroke="#5B21B6"
            strokeWidth={5}
            opacity={0.72}
          />
        </g>
      )}

      {/* IMPLANT: grey metallic titanium screw with V-threads */}
      {status === 'IMPLANT' && (
        <g transform={`translate(${W / 2 - 18}, ${isUpperArch ? 26 : H - 140})`}
          style={{ pointerEvents: 'none' }}>
          {/* Abutment cap */}
          <rect x={2} y={0} width={32} height={14} rx={3}
            fill={`url(#${gScrew})`} stroke="#475569" strokeWidth={1.2} />
          {/* Shaft */}
          <rect x={10} y={14} width={16} height={92}
            fill={`url(#${gScrew})`} stroke="#64748B" strokeWidth={0.8} />
          {/* V-thread lines — 7 sets */}
          {[22, 34, 46, 58, 70, 82, 94].map((ty) => (
            <g key={ty}>
              <line x1={4}  y1={ty} x2={10} y2={ty + 5} stroke="#334155" strokeWidth={2} />
              <line x1={26} y1={ty} x2={32} y2={ty + 5} stroke="#334155" strokeWidth={2} />
              {/* Thread horizontal base */}
              <line x1={4} y1={ty} x2={32} y2={ty} stroke="#94A3B8" strokeWidth={0.8} opacity={0.6} />
            </g>
          ))}
          {/* Apex */}
          <path d="M 10 106 L 18 122 L 26 106 Z"
            fill={`url(#${gScrew})`} stroke="#475569" strokeWidth={1} />
          {/* Metallic highlight on shaft */}
          <rect x={14} y={16} width={4} height={88} rx={1}
            fill="#E2E8F0" opacity={0.35} />
        </g>
      )}

      {/* ── Finding overlays ───────────────────────────────────────────────── */}

      {hasFinding('STAINS') && (
        <g transform={flipTransform} clipPath={`url(#${clipId})`}>
          <circle cx={W * 0.62} cy={H * 0.20} r={7}   fill="#1C0900" opacity={0.85} />
          <circle cx={W * 0.50} cy={H * 0.28} r={5}   fill="#1C0900" opacity={0.78} />
          <circle cx={W * 0.70} cy={H * 0.32} r={6}   fill="#3D1500" opacity={0.80} />
          <circle cx={W * 0.42} cy={H * 0.18} r={4.5} fill="#3D1500" opacity={0.72} />
        </g>
      )}

      {hasFinding('CALCULUS') && (
        <rect
          x={cervical.x - 4}
          y={cervical.y + cervical.h - 4}
          width={cervical.w + 8}
          height={10}
          rx={2}
          fill="#CA8A04" stroke="#92400E" strokeWidth={1.2}
          opacity={0.90}
        />
      )}

      {hasFinding('GINGIVAL_RECESSION') && (
        <line
          x1={cervical.x}
          y1={cervical.y + cervical.h + 8}
          x2={cervical.x + cervical.w}
          y2={cervical.y + cervical.h + 8}
          stroke="#EC4899" strokeWidth={3.5} strokeDasharray="8 4" strokeLinecap="round"
        />
      )}

      {hasFinding('CERVICAL_ABRASION') && (
        <path
          d={`M ${cervical.x + cervical.w / 2 - 20} ${cervical.y + 2} L ${cervical.x + cervical.w / 2} ${cervical.y - 14} L ${cervical.x + cervical.w / 2 + 20} ${cervical.y + 2}`}
          fill="none"
          stroke="#0EA5E9" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"
        />
      )}

      {hasFinding('CROWDING') && (
        <>
          <polyline
            points={`${surfaces.M.x - 4},${H / 2 - 14} ${surfaces.M.x - 14},${H / 2} ${surfaces.M.x - 4},${H / 2 + 14}`}
            fill="none" stroke="#7C3AED" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
          />
          <polyline
            points={`${surfaces.D.x + surfaces.D.w + 4},${H / 2 - 14} ${surfaces.D.x + surfaces.D.w + 14},${H / 2} ${surfaces.D.x + surfaces.D.w + 4},${H / 2 + 14}`}
            fill="none" stroke="#7C3AED" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  )
}
