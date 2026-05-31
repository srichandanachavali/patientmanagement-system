'use client'
// ── F161 · src/components/odontogram/Odontogram.tsx
// Purpose: Root odontogram — adult/pediatric mode switch by DOB age (<12=pediatric), status picker panel
// In: patientDob, initialData, onToothChange callback | Out: Odontogram | See: F160, F163, F164, F166

import { useState, useCallback } from 'react'
import { differenceInYears } from 'date-fns'
import { AdultChart, type ToothState } from './AdultChart'
import { PediatricChart } from './PediatricChart'
import { ToothStatusPicker } from './ToothStatusPicker'
import type { ToothStatus, ToothSurface } from '@/types'

interface OdontogramProps {
  patientDob: string | null
  // Phase N4: pass initialData from /api/odontogram/[patientId]
  initialData?: Record<number, ToothState>
  // Phase N4: called on each change to PUT /api/odontogram/[patientId]/[fdi]
  onToothChange?: (fdi: number, state: ToothState) => void
  readOnly?: boolean
}

function isPediatric(dob: string | null): boolean {
  if (!dob) return false
  return differenceInYears(new Date(), new Date(dob)) < 12
}

const LEGEND: { status: ToothStatus; label: string; color: string }[] = [
  { status: 'HEALTHY',  label: 'Healthy',  color: '#34D399' },
  { status: 'CARIES',   label: 'Caries',   color: '#F59E0B' },
  { status: 'MISSING',  label: 'Missing',  color: '#9CA3AF' },
  { status: 'FILLED',   label: 'Filled',   color: '#60A5FA' },
  { status: 'CROWN',    label: 'Crown',    color: '#A78BFA' },
  { status: 'RCT',      label: 'RCT',      color: '#EF4444' },
  { status: 'IMPLANT',  label: 'Implant',  color: '#86EFAC' },
]

export function Odontogram({ patientDob, initialData = {}, onToothChange, readOnly = false }: OdontogramProps) {
  const [teeth, setTeeth] = useState<Record<number, ToothState>>(initialData)
  const [selectedFdi, setSelectedFdi] = useState<number | null>(null)

  const pediatric = isPediatric(patientDob)

  const handleToothClick = useCallback((fdi: number) => {
    if (readOnly) return
    setSelectedFdi((prev) => (prev === fdi ? null : fdi))
  }, [readOnly])

  const handleStatusChange = useCallback((status: ToothStatus) => {
    if (selectedFdi === null) return
    setTeeth((prev) => {
      const next = { ...prev, [selectedFdi]: { ...prev[selectedFdi], status, surface: prev[selectedFdi]?.surface ?? null } }
      onToothChange?.(selectedFdi, next[selectedFdi])
      return next
    })
  }, [selectedFdi, onToothChange])

  const handleSurfaceChange = useCallback((surface: ToothSurface | null) => {
    if (selectedFdi === null) return
    setTeeth((prev) => {
      const next = { ...prev, [selectedFdi]: { ...prev[selectedFdi], surface, status: prev[selectedFdi]?.status ?? 'HEALTHY' } }
      onToothChange?.(selectedFdi, next[selectedFdi])
      return next
    })
  }, [selectedFdi, onToothChange])

  const selectedState = selectedFdi !== null ? teeth[selectedFdi] : null

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="overflow-x-auto rounded-lg border border-border bg-background p-6">
        {pediatric ? (
          <PediatricChart
            teeth={teeth}
            selectedFdi={selectedFdi}
            onToothClick={handleToothClick}
          />
        ) : (
          <AdultChart
            teeth={teeth}
            selectedFdi={selectedFdi}
            onToothClick={handleToothClick}
          />
        )}
      </div>

      {/* Picker panel — shown below chart when a tooth is selected */}
      {selectedFdi !== null && !readOnly && (
        <div className="max-w-sm">
          <ToothStatusPicker
            fdi={selectedFdi}
            status={selectedState?.status ?? 'HEALTHY'}
            surface={selectedState?.surface ?? null}
            onStatusChange={handleStatusChange}
            onSurfaceChange={handleSurfaceChange}
            onClose={() => setSelectedFdi(null)}
          />
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {LEGEND.map(({ status, label, color }) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm border"
              style={{ backgroundColor: color + '33', borderColor: color }}
            />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
        {readOnly && (
          <span className="text-[11px] italic text-muted-foreground">Read-only</span>
        )}
      </div>
    </div>
  )
}
