'use client'
// ── F211 · src/components/odontogram/ToothFocusEditor.tsx
// Purpose: Click-to-zoom tooth editor — full-viewport modal with shared-element zoom from the clicked
//          arch tooth's exact position to a centred hero view. Surfaces are individually tappable in
//          the large SVG; status + multi-select findings + close. Reverses smoothly back into the
//          arch position. Esc closes; backdrop click closes; focus returned to source tooth. Honours
//          prefers-reduced-motion via globals.css (.veda-focus-* rules).
// In: fdi, originRect, status, findings, surface, isUpperArch, callbacks | Out: ToothFocusEditor
// See: F161, F165, F209, F212

import { useEffect, useRef, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FDI_MAP } from '@/constants/fdi'
import {
  CONDITION_CONFIG,
  PRIMARY_STATUSES,
  TOOTH_FINDINGS,
} from '@/constants/toothConditions'
import type { ToothStatus, ToothFinding, ToothSurface } from '@/types'
import { ToothLargeSVG } from './ToothLargeSVG'
import { fdiToUniversal } from './toothGeometry'

type Phase = 'opening' | 'open' | 'closing'

interface ToothFocusEditorProps {
  fdi:              number
  originRect:       DOMRect | null
  status:           ToothStatus
  findings:         ToothFinding[]
  surface:          ToothSurface | null
  isUpperArch:      boolean
  numbering:        'fdi' | 'universal'
  readOnly?:        boolean
  onStatusChange:   (status:   ToothStatus)              => void
  onFindingsChange: (findings: ToothFinding[])           => void
  onSurfaceChange:  (surface:  ToothSurface | null)      => void
  onClose:          () => void
}

// Approximate rendered stage size at the rest state (must match CSS .veda-focus-stage width)
const STAGE_W = 540
const STAGE_H = 640

function computeOriginTransform(origin: DOMRect | null): string {
  if (typeof window === 'undefined' || !origin) {
    return 'translate(-50%, -50%) scale(0.18)'
  }
  const cx = window.innerWidth  / 2
  const cy = window.innerHeight / 2
  const dx = origin.x + origin.width  / 2 - cx
  const dy = origin.y + origin.height / 2 - cy
  // Match SOURCE size (origin.width is the arch tooth's screen width)
  const scale = Math.max(0.06, origin.width / STAGE_W)
  return `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`
}

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

export function ToothFocusEditor({
  fdi, originRect, status, findings, surface, isUpperArch, numbering,
  readOnly = false,
  onStatusChange, onFindingsChange, onSurfaceChange, onClose,
}: ToothFocusEditorProps) {
  const [phase, setPhase] = useState<Phase>('opening')
  const stageRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Drive opening → open via two RAFs so the initial transform paints first
  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase('open'))
    })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [])

  // Focus the close button once open
  useEffect(() => {
    if (phase === 'open') closeBtnRef.current?.focus()
  }, [phase])

  const closedRef = useRef(false)
  const finishClose = useCallback(() => {
    if (closedRef.current) return
    closedRef.current = true
    const src = document.querySelector<HTMLButtonElement>(`button[data-fdi="${fdi}"]`)
    src?.focus()
    onClose()
  }, [fdi, onClose])

  const startClose = useCallback(() => {
    if (phase === 'closing') return
    setPhase('closing')
    // Safety net — if transitions are disabled (prefers-reduced-motion) or transitionend doesn't fire
    setTimeout(finishClose, 420)
  }, [phase, finishClose])

  // Esc closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        startClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [startClose])

  // When the closing transform finishes, unmount + return focus
  const handleTransitionEnd = useCallback((e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (phase === 'closing' && e.propertyName === 'transform') finishClose()
  }, [phase, finishClose])

  // Stage transform per phase. Open = centred rest state; opening/closing = origin rect.
  const transform = phase === 'open'
    ? 'translate(-50%, -50%) scale(1)'
    : computeOriginTransform(originRect)

  const meta  = FDI_MAP.get(fdi)
  const label = numbering === 'universal' ? fdiToUniversal(fdi) : String(fdi)

  function toggleFinding(f: ToothFinding) {
    if (readOnly) return
    onFindingsChange(findings.includes(f) ? findings.filter(x => x !== f) : [...findings, f])
  }

  function handleSurfaceClick(s: ToothSurface) {
    if (readOnly) return
    // Toggle: clicking the current active surface clears it
    onSurfaceChange(surface === s ? null : s)
  }

  return (
    <div
      className="veda-focus-backdrop"
      data-phase={phase}
      onClick={startClose}
      role="presentation"
    >
      <div
        ref={stageRef}
        className="veda-focus-stage"
        data-phase={phase}
        style={{ transform, width: STAGE_W, height: STAGE_H }}
        onClick={(e) => e.stopPropagation()}
        onTransitionEnd={handleTransitionEnd}
        role="dialog"
        aria-modal="true"
        aria-label={`Tooth ${label}${meta ? ` — ${meta.name}` : ''} editor`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold text-foreground tabular-nums">{label}</span>
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {numbering === 'universal' ? 'Universal' : 'FDI'}
              </span>
            </div>
            {meta && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {meta.name} · {meta.quadrant.replace('-', ' ')} · {isUpperArch ? 'Upper arch' : 'Lower arch'}
              </p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={startClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close tooth editor (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid h-[calc(100%-58px)] grid-cols-[260px_1fr] gap-0">
          {/* Big anatomical tooth + surface picker */}
          <div className="flex flex-col items-center justify-center border-r border-border bg-gradient-to-b from-white to-slate-50 px-2 py-4">
            <div className="relative flex h-[380px] w-[220px] items-center justify-center">
              <ToothLargeSVG
                fdi={fdi}
                status={status}
                findings={findings}
                surface={surface}
                isUpperArch={isUpperArch}
                onSurfaceClick={handleSurfaceClick}
              />
            </div>
            <p className="mt-3 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
              Tap a surface · {surface
                ? <span className="font-semibold text-foreground">{surface} selected</span>
                : <span>none selected</span>}
            </p>
          </div>

          {/* Status + findings panel */}
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
            {/* Status */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tooth Status
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIMARY_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => !readOnly && onStatusChange(s)}
                    disabled={readOnly}
                    className={cn(
                      'rounded-md border px-2 py-1.5 text-xs font-medium transition-all',
                      CONDITION_CONFIG[s].badgeClass,
                      status === s
                        ? 'ring-2 ring-offset-1 ring-primary scale-[1.02]'
                        : 'opacity-70 hover:opacity-100 hover:scale-[1.01]',
                    )}
                    aria-pressed={status === s}
                  >
                    {CONDITION_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Findings */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Findings <span className="font-normal normal-case">(multi-select)</span>
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
                          disabled={readOnly}
                          className={cn(
                            'rounded border px-2 py-1 text-[11px] font-medium transition-all',
                            CONDITION_CONFIG[f].badgeClass,
                            findings.includes(f)
                              ? 'ring-2 ring-offset-1 ring-primary'
                              : 'opacity-60 hover:opacity-95',
                          )}
                          aria-pressed={findings.includes(f)}
                        >
                          {CONDITION_CONFIG[f].label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Surface clear */}
            {surface && (
              <button
                type="button"
                onClick={() => onSurfaceChange(null)}
                disabled={readOnly}
                className="self-start rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-background hover:text-foreground"
              >
                Clear surface ({surface})
              </button>
            )}

            <div className="mt-auto border-t border-border pt-3 text-[10px] text-muted-foreground">
              <span className="font-semibold">Esc</span> to close · <span className="font-semibold">Tab</span> to step through controls
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
