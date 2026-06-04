'use client'
// ── F163 · src/components/odontogram/AdultChart.tsx
// Purpose: Adult FDI chart — curved upper + lower arches (ADULT_UPPER + ADULT_LOWER, teeth 11–48) via
//          anatomical Tooth components with staggered entrance, mesial-midline separator, and arch labels.
// In: ADULT_UPPER/ADULT_LOWER (F032), Tooth (F165), archPlacement (F210) | Out: AdultChart, ToothState
// See: F161, F165, F210

import { Tooth } from './Tooth'
import { ADULT_UPPER, ADULT_LOWER } from '@/constants/fdi'
import { archPlacement, fdiToUniversal } from './toothGeometry'
import type { ToothStatus, ToothFinding, ToothSurface } from '@/types'

export interface ToothState {
  status:   ToothStatus
  surface:  ToothSurface | null
  findings: ToothFinding[]
}

interface AdultChartProps {
  teeth:        Record<number, ToothState>
  selectedFdi:  number | null
  numbering?:   'fdi' | 'universal'
  onToothClick: (fdi: number, rect: DOMRect) => void
  onKeyNav?:    (e: React.KeyboardEvent) => void
}

function ArchRow({
  fdis, teeth, selectedFdi, isUpperArch, numbering, onToothClick, onKeyNav,
}: {
  fdis:         number[]
  teeth:        Record<number, ToothState>
  selectedFdi:  number | null
  isUpperArch:  boolean
  numbering:    'fdi' | 'universal'
  onToothClick: (fdi: number, rect: DOMRect) => void
  onKeyNav?:    (e: React.KeyboardEvent) => void
}) {
  const midpoint = fdis.length / 2

  return (
    <div className="flex items-end justify-center">
      {fdis.map((fdi, i) => {
        const { dy, rotate } = archPlacement(i, fdis.length, isUpperArch, 22)
        const displayNumber  = numbering === 'universal' ? fdiToUniversal(fdi) : undefined
        const stateGap       = i === midpoint ? 'mx-2' : ''
        return (
          <div
            key={fdi}
            className={stateGap}
            style={{
              transform:        `translateY(${dy}px) rotate(${rotate}deg)`,
              transformOrigin:  isUpperArch ? 'center top' : 'center bottom',
              transition:       'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Tooth
              fdi={fdi}
              status={teeth[fdi]?.status   ?? 'HEALTHY'}
              findings={teeth[fdi]?.findings ?? []}
              surface={teeth[fdi]?.surface ?? null}
              isSelected={selectedFdi === fdi}
              isUpperArch={isUpperArch}
              displayNumber={displayNumber}
              entranceDelayMs={i * 22}
              onClick={(rect) => onToothClick(fdi, rect)}
              onKeyNav={onKeyNav}
            />
          </div>
        )
      })}
    </div>
  )
}

export function AdultChart({
  teeth, selectedFdi, numbering = 'fdi', onToothClick, onKeyNav,
}: AdultChartProps) {
  return (
    <div role="grid" aria-label="Adult odontogram (FDI 11–48)" className="space-y-3">
      <div className="flex justify-between px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Upper arch · Right</span>
        <span>Upper arch · Left</span>
      </div>

      <ArchRow
        fdis={ADULT_UPPER}
        teeth={teeth}
        selectedFdi={selectedFdi}
        isUpperArch={true}
        numbering={numbering}
        onToothClick={onToothClick}
        onKeyNav={onKeyNav}
      />

      {/* Midline + occlusal gap */}
      <div className="relative mx-auto h-4 w-full">
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 border-t border-dashed border-border" />
        <div className="absolute left-1/2 top-0 h-full -translate-x-1/2 border-l border-border" />
      </div>

      <ArchRow
        fdis={ADULT_LOWER}
        teeth={teeth}
        selectedFdi={selectedFdi}
        isUpperArch={false}
        numbering={numbering}
        onToothClick={onToothClick}
        onKeyNav={onKeyNav}
      />

      <div className="flex justify-between px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Lower arch · Right</span>
        <span>Lower arch · Left</span>
      </div>
    </div>
  )
}
