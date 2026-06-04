// ── F160 · src/app/(app)/odontogram/[patientId]/page.tsx
// Purpose: Odontogram page — loads latest ToothRecord per FDI (status+surface+findings) from Prisma, passes to OdontogramWrapper
// In: patientId param, Prisma ToothRecord + Patient (F002) | Out: OdontogramPage | See: F161, F162, F081
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { OdontogramWrapper } from '@/components/odontogram/OdontogramWrapper'
import type { ToothStatus, ToothFinding, ToothSurface } from '@/types'

function parseFindings(raw: string): ToothFinding[] {
  try { return JSON.parse(raw) as ToothFinding[] } catch { return [] }
}

export default async function OdontogramPage({ params }: { params: { patientId: string } }) {
  const [patient, records] = await Promise.all([
    prisma.patient.findUnique({
      where:  { id: params.patientId },
      select: { name: true, dob: true },
    }),
    prisma.toothRecord.findMany({
      where:   { patientId: params.patientId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!patient) {
    return <p className="py-8 text-center text-sm text-danger">Patient not found</p>
  }

  // Latest record per FDI (desc by createdAt, so first wins)
  const initialData: Record<number, { status: ToothStatus; surface: ToothSurface | null; findings: ToothFinding[] }> = {}
  for (const r of records) {
    if (!initialData[r.toothFdi]) {
      initialData[r.toothFdi] = {
        status:   r.status   as ToothStatus,
        surface:  (r.surface ?? null) as ToothSurface | null,
        findings: parseFindings(r.findings),
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href={`/patients/${params.patientId}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Patient Record
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium text-foreground">Odontogram</span>
      </div>

      <h2 className="text-base font-semibold text-foreground">{patient.name} — Odontogram</h2>

      <OdontogramWrapper
        patientId={params.patientId}
        patientDob={patient.dob?.toISOString() ?? null}
        initialData={initialData}
      />
    </div>
  )
}
