// ── F077 · src/app/api/appointments/route.ts
// Purpose: GET appointments filtered by ?date=YYYY-MM-DD (IST day bounds); POST create with double-booking check
// In: veda_session (F011), Prisma Appointment (F002) | Out: serialized Appointment[] / 201 | See: F010, F011, F078, F153, F151
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

function istDayBounds(dateStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split('-').map(Number)
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
  return {
    start: new Date(Date.UTC(y, m - 1, d)     - IST_OFFSET_MS),
    end:   new Date(Date.UTC(y, m - 1, d + 1) - IST_OFFSET_MS),
  }
}

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

export async function GET(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dateStr   = searchParams.get('date')
  const dentistId = searchParams.get('dentistId')
  const chair     = searchParams.get('chair')

  const where: Record<string, unknown> = {}
  if (dateStr) {
    const { start, end } = istDayBounds(dateStr)
    where.start = { gte: start, lt: end }
  }
  if (dentistId) where.dentistId = dentistId
  if (chair)     where.chair     = Number(chair)

  const appts = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, name: true, phone: true, preferredLanguage: true } },
      dentist:  { select: { id: true, name: true } },
    },
    orderBy: { start: 'asc' },
  })

  return NextResponse.json(appts.map(serialize))
}

export async function POST(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { patient_id, dentist_id, chair_id, start, end, notes } = body as Record<string, string>
  if (!patient_id || !dentist_id || !chair_id || !start || !end) {
    return NextResponse.json({ error: 'patient_id, dentist_id, chair_id, start, end are required' }, { status: 400 })
  }

  const startDt = new Date(start)
  const endDt   = new Date(end)

  // Double-booking check — same chair, overlapping time, not cancelled/no-show
  const clash = await prisma.appointment.findFirst({
    where: {
      chair:  Number(chair_id),
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      start:  { lt: endDt },
      end:    { gt: startDt },
    },
  })
  if (clash) {
    return NextResponse.json({ error: 'Chair is already booked at that time' }, { status: 409 })
  }

  const appt = await prisma.appointment.create({
    data: {
      patientId: patient_id,
      dentistId: dentist_id,
      chair:     Number(chair_id),
      start:     startDt,
      end:       endDt,
      status:    'BOOKED',
      notes:     notes ?? null,
    },
    include: {
      patient: { select: { id: true, name: true, phone: true, preferredLanguage: true } },
      dentist:  { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(serialize(appt), { status: 201 })
}
