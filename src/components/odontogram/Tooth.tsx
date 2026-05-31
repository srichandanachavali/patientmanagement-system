'use client'
// ── F165 · src/components/odontogram/Tooth.tsx
// Purpose: Single tooth SVG — FILL/STROKE per ToothStatus; Extracted=solid X, Missing=dashed X, Crowned=inner rect
// In: fdi, status, isSelected, isUpperArch, onClick | Out: Tooth | See: F163, F164, F024

import type { ToothStatus } from '@/types'

const W = 30
const H = 34

const FILL: Record<ToothStatus, string> = {
  HEALTHY: '#D1FAE5',
  CARIES:  '#FEF3C7',
  FILLED:  '#DBEAFE',
  MISSING: '#F3F4F6',
  CROWN:   '#EDE9FE',
  RCT:     '#FEE2E2',
  IMPLANT: '#F0FDF4',
}

const STROKE: Record<ToothStatus, string> = {
  HEALTHY: '#34D399',
  CARIES:  '#F59E0B',
  FILLED:  '#60A5FA',
  MISSING: '#9CA3AF',
  CROWN:   '#A78BFA',
  RCT:     '#F87171',
  IMPLANT: '#86EFAC',
}

interface ToothProps {
  fdi: number
  status: ToothStatus
  isSelected: boolean
  isUpperArch: boolean
  onClick: () => void
}

export function Tooth({ fdi, status, isSelected, isUpperArch, onClick }: ToothProps) {
  const fdiLabel = (
    <span className="select-none font-mono text-[9px] leading-none text-muted-foreground">
      {fdi}
    </span>
  )

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-[3px] focus:outline-none"
      aria-label={`Tooth ${fdi} — ${status}`}
      title={`${fdi}: ${status}`}
    >
      {isUpperArch && fdiLabel}

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
        style={{ transform: 'scale(1)', transition: 'transform 100ms ease-out' }}
      >
        <rect
          x="2"
          y="2"
          width={W - 4}
          height={H - 4}
          rx="4"
          ry="4"
          fill={FILL[status]}
          stroke={isSelected ? '#1D4ED8' : STROKE[status]}
          strokeWidth={isSelected ? 2.5 : 1.5}
          style={{ transition: 'fill 150ms ease-in-out, stroke 100ms ease-out' }}
          className="group-hover:[filter:brightness(0.94)]"
        />

        {/* RCT: solid X */}
        {status === 'RCT' && (
          <>
            <line x1="7" y1="7" x2={W - 7} y2={H - 7} stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={W - 7} y1="7" x2="7" y2={H - 7} stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}

        {/* Missing: dashed X */}
        {status === 'MISSING' && (
          <>
            <line x1="8" y1="8" x2={W - 8} y2={H - 8} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3 2" strokeLinecap="round" />
            <line x1={W - 8} y1="8" x2="8" y2={H - 8} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3 2" strokeLinecap="round" />
          </>
        )}

        {/* Crown: inner crown ring */}
        {status === 'CROWN' && (
          <rect x="6" y="6" width={W - 12} height={H - 12} rx="2" fill="none" stroke="#A78BFA" strokeWidth="1" />
        )}
      </svg>

      {!isUpperArch && fdiLabel}
    </button>
  )
}
