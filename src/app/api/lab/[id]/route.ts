// ── F071 · src/app/api/lab/[id]/route.ts
// Purpose: GET lab case detail + PATCH update (status, notes, dates)
// In: veda_session (F011), lab case id param | Out: LabCase / { ok } | See: F010, F011, F070, F182

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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lc = await prisma.labCase.findUnique({
    where: { id: params.id },
    include: {
      patient:   { select: { id: true, name: true, phone: true } },
      createdBy: { select: { name: true } },
    },
  })

  if (!lc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serialize(lc))
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const existing = await prisma.labCase.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const {
    status, lab_assistant_notes, sent_at, expected_at, delivered_at,
    lab_name, material, shade, dentist_notes, cost, tooth_numbers,
  } = body

  const updated = await prisma.labCase.update({
    where: { id: params.id },
    data: {
      ...(typeof status              === 'string' ? { status }                                   : {}),
      ...(typeof lab_assistant_notes === 'string' ? { labAssistantNotes: lab_assistant_notes }   : {}),
      ...(typeof lab_name            === 'string' ? { labName: lab_name }                        : {}),
      ...(typeof material            === 'string' ? { material }                                 : {}),
      ...(typeof shade               === 'string' ? { shade }                                    : {}),
      ...(typeof dentist_notes       === 'string' ? { dentistNotes: dentist_notes }              : {}),
      ...(typeof cost                === 'number' ? { cost }                                     : {}),
      ...(typeof tooth_numbers       === 'string' ? { toothNumbers: tooth_numbers }              : {}),
      ...(sent_at      !== undefined ? { sentAt:      sent_at      ? new Date(sent_at as string)      : null } : {}),
      ...(expected_at  !== undefined ? { expectedAt:  expected_at  ? new Date(expected_at as string)  : null } : {}),
      ...(delivered_at !== undefined ? { deliveredAt: delivered_at ? new Date(delivered_at as string) : null } : {}),
    },
    include: {
      patient:   { select: { id: true, name: true, phone: true } },
      createdBy: { select: { name: true } },
    },
  })

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'UPDATE', entity: 'LabCase', entityId: params.id },
  }).catch(() => {})

  if (typeof status === 'string' && status === 'Received' && existing.status !== 'Received') {
    const scheduled = new Date()
    scheduled.setDate(scheduled.getDate() + 1)
    scheduled.setHours(10, 0, 0, 0)
    await prisma.followUp.create({
      data: {
        patientId: existing.patientId,
        reason: `Fitting appointment — ${existing.caseType}`,
        scheduledDate: scheduled,
        status: 'PENDING',
        createdById: session.userId,
      },
    }).catch(() => {})
  }

  return NextResponse.json(serialize(updated))
}
