'use client'
// ── F162 · src/components/odontogram/OdontogramWrapper.tsx
// Purpose: Client wrapper — fire-and-forget PUT to /api/odontogram/[patientId]/[fdi] on each tooth change (status+surface+findings)
// In: patientId, patientDob, initialData | Out: OdontogramWrapper | See: F160, F161, F081

import { Odontogram } from './Odontogram'
import type { ToothState } from './AdultChart'

interface OdontogramWrapperProps {
  patientId:   string
  patientDob:  string | null
  initialData: Record<number, ToothState>
}

export function OdontogramWrapper({ patientId, patientDob, initialData }: OdontogramWrapperProps) {
  async function handleToothChange(fdi: number, state: ToothState) {
    await fetch(`/api/odontogram/${patientId}/${fdi}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status:   state.status,
        surface:  state.surface,
        findings: state.findings,
      }),
    }).catch(() => {})
  }

  return (
    <Odontogram
      patientDob={patientDob}
      initialData={initialData}
      onToothChange={handleToothChange}
    />
  )
}
