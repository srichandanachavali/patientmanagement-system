'use client'
// ── F166 · src/components/odontogram/ToothStatusPicker.tsx
// Purpose: Status + surface picker panel shown below chart when a tooth is selected
// In: fdi, status, surface props; FDI_MAP (F032), TOOTH_STATUSES/TOOTH_SURFACES (F031) | Out: ToothStatusPicker | See: F161, F031, F032

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FDI_MAP } from '@/constants/fdi'
import { TOOTH_STATUSES, TOOTH_SURFACES } from '@/constants/enums'
import type { ToothStatus, ToothSurface } from '@/types'

const STATUS_COLOR: Record<ToothStatus, string> = {
  HEALTHY: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  CARIES:  'bg-amber-100 text-amber-800 border-amber-300',
  FILLED:  'bg-blue-100 text-blue-800 border-blue-300',
  MISSING: 'bg-gray-100 text-gray-700 border-gray-300',
  CROWN:   'bg-purple-100 text-purple-800 border-purple-300',
  RCT:     'bg-red-100 text-red-800 border-red-300',
  IMPLANT: 'bg-green-100 text-green-800 border-green-300',
}

const SURFACE_LABELS: Record<ToothSurface, string> = {
  M: 'Mesial',
  D: 'Distal',
  O: 'Occlusal',
  B: 'Buccal',
  L: 'Lingual',
}

interface ToothStatusPickerProps {
  fdi: number
  status: ToothStatus
  surface: ToothSurface | null
  onStatusChange: (status: ToothStatus) => void
  onSurfaceChange: (surface: ToothSurface | null) => void
  onClose: () => void
}

export function ToothStatusPicker({
  fdi,
  status,
  surface,
  onStatusChange,
  onSurfaceChange,
  onClose,
}: ToothStatusPickerProps) {
  const meta = FDI_MAP.get(fdi)

  return (
    <div className="rounded-lg border border-border bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">{fdi}</span>
          {meta && (
            <span className="text-xs text-muted-foreground">
              {meta.name} · {meta.quadrant.replace('-', ' ')}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close picker"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status selector */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {TOOTH_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                className={cn(
                  'rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all',
                  STATUS_COLOR[s],
                  status === s ? 'ring-2 ring-primary ring-offset-1' : 'opacity-70 hover:opacity-100',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Surface selector */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Surface
          </p>
          <div className="flex gap-1.5">
            {TOOTH_SURFACES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSurfaceChange(surface === s ? null : s)}
                title={SURFACE_LABELS[s]}
                className={cn(
                  'flex h-7 w-9 items-center justify-center rounded border font-mono text-[11px] font-medium transition-colors',
                  surface === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
