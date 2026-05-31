// ── F070 · src/app/api/lab/route.ts
// Purpose: GET all lab cases (with patient name, filtering) + POST create new lab case
// In: veda_session (F011), Prisma LabCase (F002) | Out: LabCase[] / 201 | See: F010, F011, F071, F182

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

function serialize(lc: {
  id: string; caseType: string; toothNumbers: string | null; material: string | null
  shade: string | null; labName: string | null; dentistNotes: string | null
  labAssistantNotes: string | null; cost: number | null; status: string
  sentAt: Date | null; expectedAt: Date | null; deliveredAt: Date | null
  createdAt: Date; updatedAt: Date
  patient: { id: string; name: string; phone: string }
  createdBy: { name: string } | null
}) {
  return {
    id:                    lc.id,
    case_type:             lc.caseType,
    tooth_numbers:         lc.toothNumbers,
    material:              lc.material,
    shade:                 lc.shade,
    lab_name:              lc.labName,
    dentist_notes:         lc.dentistNotes,
    lab_assistant_notes:   lc.labAssistantNotes,
    cost:                  lc.cost,
    status:                lc.status,
    sent_at:               lc.sentAt?.toISOString() ?? null,
    expected_at:           lc.expectedAt?.toISOString() ?? null,
    delivered_at:          lc.deliveredAt?.toISOString() ?? null,
    created_at:            lc.createdAt.toISOString(),
    updated_at:            lc.updatedAt.toISOString(),
    patient_id:            lc.patient.id,
    patient_name:          lc.patient.name,
    patient_phone:         lc.patient.phone,
    created_by_name:       lc.createdBy?.name ?? null,
  }
}

export async function GET(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status     = searchParams.get('status')
  const patientId  = searchParams.get('patientId')

  const labCases = await prisma.labCase.findMany({
    where: {
      ...(status    ? { status }              : {}),
      ...(patientId ? { patientId }           : {}),
    },
    include: {
      patient:   { select: { id: true, name: true, phone: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(labCases.map(serialize))
}

export async function POST(request: Request) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    patient_id, case_type, tooth_numbers, material, shade,
    lab_name, dentist_notes, cost, status, expected_at,
  } = body as Record<string, unknown>

  if (!patient_id || typeof patient_id !== 'string') {
    return NextResponse.json({ error: 'patient_id is required' }, { status: 400 })
  }

  const patient = await prisma.patient.findUnique({ where: { id: patient_id } })
  if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  const lc = await prisma.labCase.create({
    data: {
      patientId:   patient_id,
      caseType:    typeof case_type    === 'string' ? case_type    : 'Other',
      toothNumbers:typeof tooth_numbers=== 'string' ? tooth_numbers: null,
      material:    typeof material     === 'string' ? material     : null,
      shade:       typeof shade        === 'string' ? shade        : null,
      labName:     typeof lab_name     === 'string' ? lab_name     : null,
      dentistNotes:typeof dentist_notes=== 'string' ? dentist_notes: null,
      cost:        typeof cost         === 'number' ? cost         : null,
      status:      typeof status       === 'string' ? status       : 'Planned',
      expectedAt:  typeof expected_at  === 'string' ? new Date(expected_at) : null,
      createdById: session.userId,
    },
    include: {
      patient:   { select: { id: true, name: true, phone: true } },
      createdBy: { select: { name: true } },
    },
  })

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'CREATE', entity: 'LabCase', entityId: lc.id },
  }).catch(() => {})

  return NextResponse.json(serialize(lc), { status: 201 })
}
