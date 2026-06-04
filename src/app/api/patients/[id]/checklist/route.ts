// ── F200 · src/app/api/patients/[id]/checklist/route.ts
// Purpose: GET + PATCH patient safety checklist (upsert on PATCH)
// In: veda_session (F011), patientId param | Out: PatientChecklist | See: F010, F011

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const checklist = await prisma.patientChecklist.findUnique({
    where: { patientId: params.id },
  })

  return NextResponse.json(checklist ?? null)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await (async () => { try { return await requireSession() } catch { return null } })()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    drugAllergiesConfirmed?: boolean
    consentRecorded?: boolean
    chiefComplaintNoted?: boolean
    medicalHistoryReviewed?: boolean
    bpStatus?: string | null
    diabeticStatus?: string | null
    bleedingDisorder?: boolean
    pregnancyStatus?: string | null
    currentMedications?: string | null
    dentalHistoryReviewed?: boolean
    tobaccoHabit?: string | null
    lastXrayDate?: string | null
    lastXrayType?: string | null
  }

  const mandatory = {
    drugAllergiesConfirmed: body.drugAllergiesConfirmed ?? false,
    consentRecorded:        body.consentRecorded ?? false,
    chiefComplaintNoted:    body.chiefComplaintNoted ?? false,
  }
  const readyForTreatment = Object.values(mandatory).every(Boolean)

  const shared = {
    ...mandatory,
    medicalHistoryReviewed: body.medicalHistoryReviewed ?? false,
    bpStatus:               body.bpStatus ?? null,
    diabeticStatus:         body.diabeticStatus ?? null,
    bleedingDisorder:       body.bleedingDisorder ?? false,
    pregnancyStatus:        body.pregnancyStatus ?? null,
    currentMedications:     body.currentMedications ?? null,
    dentalHistoryReviewed:  body.dentalHistoryReviewed ?? false,
    tobaccoHabit:           body.tobaccoHabit ?? null,
    lastXrayDate:           body.lastXrayDate ? new Date(body.lastXrayDate) : null,
    lastXrayType:           body.lastXrayType ?? null,
    readyForTreatment,
    lastReviewedAt:         new Date(),
    lastReviewedById:       session.userId,
  }

  const checklist = await prisma.patientChecklist.upsert({
    where:  { patientId: params.id },
    update: shared,
    create: { patientId: params.id, ...shared },
  })

  return NextResponse.json(checklist)
}
