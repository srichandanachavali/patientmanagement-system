// ── F072 · src/app/api/recalls/route.ts
// Purpose: GET patients overdue for recall — last COMPLETED appt >6 months ago, no future appt
// In: veda_session (F011), Prisma Patient + Appointment (F002) | Out: serialized recall list | See: F010, F011, F183, F130
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

const SIX_MONTHS_MS = 183 * 24 * 60 * 60 * 1000

export async function GET() {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - SIX_MONTHS_MS)
  const now    = new Date()

  const patients = await prisma.patient.findMany({
    where: {
      AND: [
        { appointments: { some: { status: 'COMPLETED', start: { lt: cutoff } } } },
        { appointments: { none: { start: { gt: now }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } } } },
      ],
    },
    select: {
      id: true, name: true, phone: true, preferredLanguage: true,
      appointments: {
        where:   { status: 'COMPLETED' },
        orderBy: { start: 'desc' },
        take:    1,
        select:  { start: true },
      },
    },
    orderBy: { name: 'asc' },
    take: 50,
  })

  return NextResponse.json(patients.map((p) => ({
    id:                 p.id,
    name:               p.name,
    phone:              p.phone,
    preferred_language: p.preferredLanguage,
    last_visit:         p.appointments[0]?.start.toISOString() ?? null,
  })))
}
