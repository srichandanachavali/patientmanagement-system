'use client'
// ── F162 · src/components/odontogram/OdontogramWrapper.tsx
// Purpose: Client wrapper — fire-and-forget PUT to /api/odontogram/[patientId]/[fdi] on each tooth change
// In: patientId, patientDob, initialData | Out: OdontogramWrapper | See: F160, F161

import { Odontogram } from './Odontogram'
import type { ToothStatus, ToothSurface } from '@/types'

interface ToothState { status: ToothStatus; surface: ToothSurface | null }

interface OdontogramWrapperProps {
  patientId: string
  patientDob: string | null
  initialData: Record<number, ToothState>
}

export function OdontogramWrapper({ patientId, patientDob, initialData }: OdontogramWrapperProps) {
  async function handleToothChange(fdi: number, state: ToothState) {
    // Optimistic — local state already updated by Odontogram; fire-and-forget to persist
    await fetch(`/api/odontogram/${patientId}/${fdi}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: state.status, surface: state.surface }),
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
