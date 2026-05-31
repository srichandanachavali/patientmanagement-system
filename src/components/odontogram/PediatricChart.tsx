'use client'
// ── F164 · src/components/odontogram/PediatricChart.tsx
// Purpose: Pediatric FDI chart — renders PRIMARY_UPPER + PRIMARY_LOWER (teeth 51–85, 20 total)
// In: PRIMARY_UPPER/PRIMARY_LOWER (F032), Tooth (F165), ToothState (F163) | Out: PediatricChart | See: F161, F165, F032

import { Tooth } from './Tooth'
import { PRIMARY_UPPER, PRIMARY_LOWER } from '@/constants/fdi'
import type { ToothState } from './AdultChart'

interface PediatricChartProps {
  teeth: Record<number, ToothState>
  selectedFdi: number | null
  onToothClick: (fdi: number) => void
}

function PrimaryRow({
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
      <div className="h-10 w-px bg-border" />
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

export function PediatricChart({ teeth, selectedFdi, onToothClick }: PediatricChartProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Upper arch</span>
        <span>FDI notation — Primary (Pediatric)</span>
      </div>

      <PrimaryRow
        fdis={PRIMARY_UPPER}
        teeth={teeth}
        selectedFdi={selectedFdi}
        isUpperArch={true}
        onToothClick={onToothClick}
      />

      <div className="mx-auto w-2/3 border-t border-dashed border-border" />

      <PrimaryRow
        fdis={PRIMARY_LOWER}
        teeth={teeth}
        selectedFdi={selectedFdi}
        isUpperArch={false}
        onToothClick={onToothClick}
      />

      <div className="flex justify-between px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Lower arch</span>
        <span>20 teeth</span>
      </div>
    </div>
  )
}
