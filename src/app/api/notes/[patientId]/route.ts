// ── F080 · src/app/api/notes/[patientId]/route.ts
// Purpose: GET all clinical notes for a patient, newest first
// In: veda_session (F011), Prisma ClinicalNote (F002) | Out: serialized ClinicalNote[] | See: F010, F011, F079, F167
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET(_req: Request, { params }: { params: { patientId: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notes = await prisma.clinicalNote.findMany({
    where:   { patientId: params.patientId },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(notes.map((n) => ({
    id:             n.id,
    body:           n.body,
    appointment_id: n.appointmentId,
    created_at:     n.createdAt.toISOString(),
    profiles:       n.author,
  })))
}
