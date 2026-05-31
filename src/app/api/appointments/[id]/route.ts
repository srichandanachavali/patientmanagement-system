// ── F078 · src/app/api/appointments/[id]/route.ts
// Purpose: GET single appointment detail; PATCH status or notes
// In: veda_session (F011), Prisma Appointment (F002) | Out: serialized Appointment | See: F010, F011, F077, F152
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

const VALID_STATUSES = ['BOOKED', 'CONFIRMED', 'ARRIVED', 'IN_CHAIR', 'COMPLETED', 'NO_SHOW', 'CANCELLED']

function serialize(a: {
  id: string; start: Date; end: Date; status: string; notes: string | null; chair: number
  patient: { id: string; name: string; phone: string; preferredLanguage: string } | null
  dentist:  { id: string; name: string } | null
}) {
  return {
    id:       a.id,
    start:    a.start.toISOString(),
    end:      a.end.toISOString(),
    status:   a.status,
    notes:    a.notes,
    chair_id: a.chair,
    patients: a.patient ? {
      id: a.patient.id,
      name: a.patient.name,
      phone: a.patient.phone,
      preferred_language: a.patient.preferredLanguage,
    } : null,
    profiles: a.dentist ? { id: a.dentist.id, name: a.dentist.name } : null,
  }
}

const include = {
  patient: { select: { id: true, name: true, phone: true, preferredLanguage: true } },
  dentist:  { select: { id: true, name: true } },
} as const

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appt = await prisma.appointment.findUnique({ where: { id: params.id }, include })
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(serialize(appt))
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, notes } = body as Record<string, string>
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (status !== undefined) data.status = status
  if (notes  !== undefined) data.notes  = notes

  const appt = await prisma.appointment.update({ where: { id: params.id }, data, include })
  return NextResponse.json(serialize(appt))
}
