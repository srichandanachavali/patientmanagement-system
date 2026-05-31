// ── F079 · src/app/api/notes/route.ts
// Purpose: POST create clinical note for a patient, linked to an appointment
// In: veda_session (F011), Prisma ClinicalNote (F002) | Out: 201 serialized note | See: F010, F011, F080, F167
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function POST(request: Request) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { patient_id, appointment_id, body: noteBody } = body as Record<string, string>
  if (!patient_id || !noteBody?.trim()) {
    return NextResponse.json({ error: 'patient_id and body are required' }, { status: 400 })
  }

  const note = await prisma.clinicalNote.create({
    data: {
      patientId:     patient_id,
      appointmentId: appointment_id?.trim() || null,
      authorId:      session.userId,
      body:          noteBody.trim(),
    },
    include: { author: { select: { id: true, name: true } } },
  })

  return NextResponse.json({
    id:             note.id,
    body:           note.body,
    appointment_id: note.appointmentId,
    created_at:     note.createdAt.toISOString(),
    profiles:       note.author,
  }, { status: 201 })
}
