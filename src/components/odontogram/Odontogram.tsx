'use client'
// ── F161 · src/components/odontogram/Odontogram.tsx
// Purpose: Root odontogram — adult/pediatric switch, FDI/Universal numbering toggle, arrow-key tooth
//          navigation, and the click-to-zoom focus editor (F211) for editing status / findings /
//          surfaces. The cramped side-panel picker has been replaced by a centred hero modal that
//          performs a shared-element animation from the clicked arch tooth's exact position.
// In: patientDob, initialData, onToothChange callback | Out: Odontogram
// See: F160, F163, F164, F165, F211, F212, F209, F210

import { useState, useCallback, useMemo } from 'react'
import { differenceInYears } from 'date-fns'
import { AdultChart, type ToothState } from './AdultChart'
import { PediatricChart } from './PediatricChart'
import { ToothFocusEditor } from './ToothFocusEditor'
import { CONDITION_CONFIG, PRIMARY_STATUSES, TOOTH_FINDINGS } from '@/constants/toothConditions'
import { ADULT_UPPER, ADULT_LOWER, PRIMARY_UPPER, PRIMARY_LOWER } from '@/constants/fdi'
import type { ToothStatus, ToothFinding, ToothSurface } from '@/types'

interface OdontogramProps {
  patientDob:    string | null
  initialData?:  Record<number, ToothState>
  onToothChange?:(fdi: number, state: ToothState) => void
  readOnly?:     boolean
}

function isPediatric(dob: string | null): boolean {
  if (!dob) return false
  return differenceInYears(new Date(), new Date(dob)) < 12
}

function isUpperArchFdi(fdi: number): boolean {
  const q = Math.floor(fdi / 10)
  return q === 1 || q === 2 || q === 5 || q === 6
}

export function Odontogram({ patientDob, initialData = {}, onToothChange, readOnly = false }: OdontogramProps) {
  const [teeth, setTeeth]               = useState<Record<number, ToothState>>(initialData)
  // Focus editor state — fdi + the arch-button's bounding rect (for shared-element zoom)
  const [focusedFdi, setFocusedFdi]     = useState<number | null>(null)
  const [originRect, setOriginRect]     = useState<DOMRect | null>(null)
  const [numbering, setNumbering]       = useState<'fdi' | 'universal'>('fdi')

  const pediatric = isPediatric(patientDob)

  // FDI order across the whole chart (used for arrow-key navigation)
  const navRows: number[][] = useMemo(
    () => pediatric ? [PRIMARY_UPPER, PRIMARY_LOWER] : [ADULT_UPPER, ADULT_LOWER],
    [pediatric],
  )

  const handleToothClick = useCallback((fdi: number, rect: DOMRect) => {
    if (readOnly) {
      setFocusedFdi(fdi); setOriginRect(rect); return
    }
    setFocusedFdi(fdi)
    setOriginRect(rect)
  }, [readOnly])

  const updateTooth = useCallback((fdi: number, partial: Partial<ToothState>) => {
    setTeeth((prev) => {
      const current = prev[fdi] ?? { status: 'HEALTHY' as ToothStatus, surface: null, findings: [] }
      const next    = { ...prev, [fdi]: { ...current, ...partial } }
      onToothChange?.(fdi, next[fdi])
      return next
    })
  }, [onToothChange])

  const handleStatusChange   = useCallback((status: ToothStatus)              => { if (focusedFdi !== null) updateTooth(focusedFdi, { status })   }, [focusedFdi, updateTooth])
  const handleFindingsChange = useCallback((findings: ToothFinding[])         => { if (focusedFdi !== null) updateTooth(focusedFdi, { findings }) }, [focusedFdi, updateTooth])
  const handleSurfaceChange  = useCallback((surface: ToothSurface | null)     => { if (focusedFdi !== null) updateTooth(focusedFdi, { surface })  }, [focusedFdi, updateTooth])

  // ── Keyboard navigation across the arch ────────────────────────────────────────────────────
  const handleKeyNav = useCallback((e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement
    const fdi = Number(target.getAttribute('data-fdi'))
    if (!fdi) return

    const rowIdx = navRows.findIndex((row) => row.includes(fdi))
    if (rowIdx < 0) return
    const col = navRows[rowIdx].indexOf(fdi)

    let nextFdi: number | null = null
    if (e.key === 'ArrowLeft')  nextFdi = navRows[rowIdx][col - 1] ?? null
    if (e.key === 'ArrowRight') nextFdi = navRows[rowIdx][col + 1] ?? null
    if (e.key === 'ArrowUp')    nextFdi = navRows[rowIdx - 1]?.[col] ?? null
    if (e.key === 'ArrowDown')  nextFdi = navRows[rowIdx + 1]?.[col] ?? null

    if (nextFdi !== null) {
      e.preventDefault()
      const nextBtn = document.querySelector<HTMLButtonElement>(`button[data-fdi="${nextFdi}"]`)
      nextBtn?.focus()
    }
  }, [navRows])

  const focusedState = focusedFdi !== null
    ? (teeth[focusedFdi] ?? { status: 'HEALTHY' as ToothStatus, surface: null, findings: [] })
    : null

  return (
    <div className="space-y-4">
      {/* Toolbar: numbering toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          Tap a tooth to zoom · Arrow keys to navigate · Enter to open · Esc to close
        </p>
        <div className="inline-flex items-center rounded-md border border-border bg-surface p-0.5">
          <button
            type="button"
            onClick={() => setNumbering('fdi')}
            className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              numbering === 'fdi'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={numbering === 'fdi'}
          >
            FDI
          </button>
          <button
            type="button"
            onClick={() => setNumbering('universal')}
            className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              numbering === 'universal'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={numbering === 'universal'}
          >
            Universal
          </button>
        </div>
      </div>

      {/* Chart canvas */}
      <div
        className="overflow-x-auto rounded-xl border border-border p-6 shadow-sm"
        style={{ background: 'radial-gradient(ellipse at center, #FFFFFF 0%, #F4F6FA 100%)' }}
      >
        {pediatric ? (
          <PediatricChart
            teeth={teeth}
            selectedFdi={focusedFdi}
            numbering={numbering}
            onToothClick={handleToothClick}
            onKeyNav={handleKeyNav}
          />
        ) : (
          <AdultChart
            teeth={teeth}
            selectedFdi={focusedFdi}
            numbering={numbering}
            onToothClick={handleToothClick}
            onKeyNav={handleKeyNav}
          />
        )}
      </div>

      {/* Focus editor — mounts on tooth click, shared-element zoom from origin rect */}
      {focusedFdi !== null && focusedState && (
        <ToothFocusEditor
          fdi={focusedFdi}
          originRect={originRect}
          status={focusedState.status}
          findings={focusedState.findings}
          surface={focusedState.surface}
          isUpperArch={isUpperArchFdi(focusedFdi)}
          numbering={numbering}
          readOnly={readOnly}
          onStatusChange={handleStatusChange}
          onFindingsChange={handleFindingsChange}
          onSurfaceChange={handleSurfaceChange}
          onClose={() => { setFocusedFdi(null); setOriginRect(null) }}
        />
      )}

      {/* Legend */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <p className="w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </p>
          {PRIMARY_STATUSES.map((s) => {
            const c = CONDITION_CONFIG[s]
            return (
              <div key={s} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-sm border"
                  style={{ backgroundColor: s === 'HEALTHY' ? '#FFFFFF' : c.fillColor, borderColor: c.strokeColor }}
                />
                <span className="text-[11px] text-foreground">
                  {c.label}
                  {c.glyph && <span className="ml-1 font-mono text-[9px] text-muted-foreground">[{c.glyph}]</span>}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <p className="w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Findings
          </p>
          {TOOTH_FINDINGS.map((f) => {
            const c = CONDITION_CONFIG[f]
            return (
              <div key={f} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-sm border"
                  style={{ backgroundColor: c.fillColor + 'AA', borderColor: c.strokeColor }}
                />
                <span className="text-[11px] text-foreground">
                  {c.label}
                  <span className="ml-1 text-[9px] text-muted-foreground/70">({c.level})</span>
                </span>
              </div>
            )
          })}
        </div>
        {readOnly && (
          <span className="text-[11px] italic text-muted-foreground">Read-only</span>
        )}
      </div>
    </div>
  )
}
