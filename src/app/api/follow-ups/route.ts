// ── F202 · src/app/api/follow-ups/route.ts
// Purpose: GET follow-up list (filterable by status/date/patient) + POST create
// In: veda_session (F011), ?status=&patientId=&due= | Out: FollowUp[] | See: F010, F011

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status    = searchParams.get('status')       // PENDING|DONE|MISSED
  const patientId = searchParams.get('patientId')
  const due       = searchParams.get('due')          // 'today'|'week'|'overdue'

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd   = new Date(todayStart.getTime() + 86_400_000)
  const weekEnd    = new Date(todayStart.getTime() + 7 * 86_400_000)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (status)    where.status    = status
  if (patientId) where.patientId = patientId

  if (due === 'today') {
    where.scheduledDate = { gte: todayStart, lt: todayEnd }
    where.status = 'PENDING'
  } else if (due === 'week') {
    where.scheduledDate = { gte: todayStart, lt: weekEnd }
    where.status = 'PENDING'
  } else if (due === 'overdue') {
    where.scheduledDate = { lt: todayStart }
    where.status = 'PENDING'
  }

  const followUps = await prisma.followUp.findMany({
    where,
    orderBy: { scheduledDate: 'asc' },
    include: {
      patient: { select: { id: true, name: true, phone: true, preferredLanguage: true } },
    },
  })

  return NextResponse.json(followUps)
}

export async function POST(request: Request) {
  const session = await (async () => { try { return await requireSession() } catch { return null } })()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    patientId: string
    reason: string
    scheduledDate: string
    notes?: string
    treatmentPlanId?: string
  }

  if (!body.patientId || !body.reason || !body.scheduledDate) {
    return NextResponse.json({ error: 'patientId, reason, scheduledDate required' }, { status: 400 })
  }

  const followUp = await prisma.followUp.create({
    data: {
      patientId:      body.patientId,
      reason:         body.reason,
      scheduledDate:  new Date(body.scheduledDate),
      notes:          body.notes ?? null,
      treatmentPlanId: body.treatmentPlanId ?? null,
      createdById:    session.userId,
    },
    include: {
      patient: { select: { id: true, name: true, phone: true, preferredLanguage: true } },
    },
  })

  return NextResponse.json(followUp, { status: 201 })
}
