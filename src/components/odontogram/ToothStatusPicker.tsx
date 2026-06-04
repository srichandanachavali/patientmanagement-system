'use client'
// ── F166 · src/components/odontogram/ToothStatusPicker.tsx
// Purpose: Status + findings + surface picker — full surface names, findings grouped by clinical level
// In: fdi, status, findings, surface; CONDITION_CONFIG (F209), FDI_MAP (F032) | Out: ToothStatusPicker | See: F161, F209, F032

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FDI_MAP } from '@/constants/fdi'
import {
  CONDITION_CONFIG,
  PRIMARY_STATUSES,
  TOOTH_FINDINGS,
  SURFACE_CONFIG,
} from '@/constants/toothConditions'
import type { ToothStatus, ToothFinding, ToothSurface } from '@/types'

// Group findings by clinical level for display
const FINDINGS_BY_LEVEL = {
  tooth:    TOOTH_FINDINGS.filter(f => CONDITION_CONFIG[f].level === 'tooth'),
  gingival: TOOTH_FINDINGS.filter(f => CONDITION_CONFIG[f].level === 'gingival'),
  arch:     TOOTH_FINDINGS.filter(f => CONDITION_CONFIG[f].level === 'arch'),
}

const LEVEL_LABEL: Record<string, string> = {
  tooth:    'Tooth-level',
  gingival: 'Gingival / Site',
  arch:     'Arch / Region',
}

interface ToothStatusPickerProps {
  fdi:             number
  status:          ToothStatus
  findings:        ToothFinding[]
  surface:         ToothSurface | null
  onStatusChange:  (status: ToothStatus)    => void
  onFindingsChange:(findings: ToothFinding[]) => void
  onSurfaceChange: (surface: ToothSurface | null) => void
  onClose:         () => void
}

export function ToothStatusPicker({
  fdi, status, findings, surface,
  onStatusChange, onFindingsChange, onSurfaceChange, onClose,
}: ToothStatusPickerProps) {
  const meta = FDI_MAP.get(fdi)

  function toggleFinding(f: ToothFinding) {
    onFindingsChange(
      findings.includes(f) ? findings.filter(x => x !== f) : [...findings, f]
    )
  }

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

        {/* ── Status (primary, mutually exclusive) ────────────────────── */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tooth Status
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {PRIMARY_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                className={cn(
                  'rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all',
                  CONDITION_CONFIG[s].badgeClass,
                  status === s ? 'ring-2 ring-primary ring-offset-1' : 'opacity-70 hover:opacity-100',
                )}
              >
                {CONDITION_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Findings (multi-select, grouped by clinical level) ───────── */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Findings <span className="normal-case font-normal">(multi-select)</span>
          </p>
          <div className="space-y-2">
            {(['tooth', 'gingival', 'arch'] as const).map((level) => (
              <div key={level}>
                <p className="mb-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {LEVEL_LABEL[level]}
                </p>
                <div className="flex flex-wrap gap-1">
                  {FINDINGS_BY_LEVEL[level].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFinding(f)}
                      className={cn(
                        'rounded border px-2 py-1 text-[11px] font-medium transition-all',
                        CONDITION_CONFIG[f].badgeClass,
                        findings.includes(f)
                          ? 'ring-2 ring-primary ring-offset-1'
                          : 'opacity-60 hover:opacity-90',
                      )}
                    >
                      {CONDITION_CONFIG[f].label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Surface (single-select, full names, good touch targets) ─── */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Surface
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {SURFACE_CONFIG.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => onSurfaceChange(surface === code as ToothSurface ? null : code as ToothSurface)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-md border px-2 py-2 transition-colors',
                  surface === code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
              >
                <span className="text-[11px] font-medium leading-tight text-center">{label}</span>
                <span className={cn(
                  'font-mono text-[9px] leading-none',
                  surface === code ? 'text-primary/70' : 'text-muted-foreground/60',
                )}>
                  {code}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
