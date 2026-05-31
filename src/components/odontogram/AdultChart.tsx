'use client'
// ── F163 · src/components/odontogram/AdultChart.tsx
// Purpose: Adult FDI chart — renders ADULT_UPPER + ADULT_LOWER (teeth 11–48) via Tooth components
// In: ADULT_UPPER/ADULT_LOWER (F032), Tooth (F165), ToothState | Out: AdultChart, ToothState | See: F161, F165, F032

import { Tooth } from './Tooth'
import { ADULT_UPPER, ADULT_LOWER } from '@/constants/fdi'
import type { ToothStatus, ToothSurface } from '@/types'

export interface ToothState {
  status: ToothStatus
  surface: ToothSurface | null
}

interface AdultChartProps {
  teeth: Record<number, ToothState>
  selectedFdi: number | null
  onToothClick: (fdi: number) => void
}

function ToothRow({
  fdis,
  teeth,
  selectedFdi,
  isUpperArch,
  onToothClick,
}: {
  fdis: number[]
  teeth: Record<number, ToothState>
  selectedFdi: number | null
  isUpperArch: boolean
  onToothClick: (fdi: number) => void
}) {
  const midpoint = fdis.length / 2
  const left = fdis.slice(0, midpoint)
  const right = fdis.slice(midpoint)

  return (
    <div className="flex items-center justify-center gap-6">
      <div className="flex gap-0.5">
        {left.map((fdi) => (
          <Tooth
            key={fdi}
            fdi={fdi}
            status={teeth[fdi]?.status ?? 'Healthy'}
            isSelected={selectedFdi === fdi}
            isUpperArch={isUpperArch}
            onClick={() => onToothClick(fdi)}
          />
        ))}
      </div>
      <div className="h-12 w-px bg-border" />
      <div className="flex gap-0.5">
        {right.map((fdi) => (
          <Tooth
            key={fdi}
            fdi={fdi}
            status={teeth[fdi]?.status ?? 'Healthy'}
            isSelected={selectedFdi === fdi}
            isUpperArch={isUpperArch}
            onClick={() => onToothClick(fdi)}
          />
        ))}
      </div>
    </div>
  )
}

export function AdultChart({ teeth, selectedFdi, onToothClick }: AdultChartProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Upper arch</span>
        <span>FDI notation — Adult</span>
      </div>

      <ToothRow
        fdis={ADULT_UPPER}
        teeth={teeth}
        selectedFdi={selectedFdi}
        isUpperArch={true}
        onToothClick={onToothClick}
      />

      <div className="mx-auto w-3/4 border-t border-dashed border-border" />

      <ToothRow
        fdis={ADULT_LOWER}
        teeth={teeth}
        selectedFdi={selectedFdi}
        isUpperArch={false}
        onToothClick={onToothClick}
      />

      <div className="flex justify-between px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Lower arch</span>
        <span>32 teeth</span>
      </div>
    </div>
  )
}
