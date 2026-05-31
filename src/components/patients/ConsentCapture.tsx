'use client'
// ── F147 · src/components/patients/ConsentCapture.tsx
// Purpose: DPDP Act 2023 consent checkboxes — 3 uppercase scopes; CLINICAL always pre-checked + required
// In: DPDP_NOTICE_VERSION (F030), ConsentScope (F022) | Out: ConsentCapture | See: F141, F030, F022

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { DPDP_NOTICE_VERSION } from '@/constants/clinic'
import type { ConsentScope } from '@/types'

const SCOPES: { scope: ConsentScope; label: string; description: string; required: boolean }[] = [
  {
    scope: 'CLINICAL',
    label: 'Clinical care',
    description: 'Use your health information to provide dental treatment, maintain records, and coordinate care.',
    required: true,
  },
  {
    scope: 'BILLING',
    label: 'Billing & invoicing',
    description: 'Process payments, generate invoices, and share information with your insurer if applicable.',
    required: false,
  },
  {
    scope: 'REMINDERS',
    label: 'Appointment reminders',
    description: 'Send appointment confirmations, recall reminders, and care instructions via SMS or WhatsApp.',
    required: false,
  },
]

interface ConsentCaptureProps {
  onChange: (granted: ConsentScope[]) => void
}

export function ConsentCapture({ onChange }: ConsentCaptureProps) {
  const [checked, setChecked] = useState<Set<ConsentScope>>(new Set(['CLINICAL']))

  function toggle(scope: ConsentScope, required: boolean) {
    if (required) return
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(scope) ? next.delete(scope) : next.add(scope)
      onChange(Array.from(next))
      return next
    })
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-info" />
        <p className="text-sm font-semibold text-foreground">
          Patient Consent — DPDP Act 2023
        </p>
        <span className="ml-auto text-[10px] text-muted-foreground">
          Notice v{DPDP_NOTICE_VERSION}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Under India's Digital Personal Data Protection Act 2023, we must obtain explicit consent before processing personal data. Please read each purpose and check to grant consent.
      </p>

      <div className="space-y-2">
        {SCOPES.map(({ scope, label, description, required }) => (
          <label
            key={scope}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-background p-3 hover:bg-surface/60"
          >
            <input
              type="checkbox"
              checked={checked.has(scope)}
              onChange={() => toggle(scope, required)}
              disabled={required}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {label}
                {required && (
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(required)</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
