// ── F203 · src/app/api/follow-ups/[id]/route.ts
// Purpose: GET single follow-up + PATCH status/notes + DELETE
// In: veda_session (F011), id param | Out: FollowUp | See: F010, F011, F202

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const followUp = await prisma.followUp.findUnique({
    where: { id: params.id },
    include: { patient: { select: { id: true, name: true, phone: true, preferredLanguage: true } } },
  })
  if (!followUp) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(followUp)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json() as Record<string, unknown>
  const followUp = await prisma.followUp.update({
    where: { id: params.id },
    data: {
      ...(body.status        !== undefined && { status: body.status as string }),
      ...(body.notes         !== undefined && { notes: body.notes as string | null }),
      ...(body.scheduledDate !== undefined && { scheduledDate: new Date(body.scheduledDate as string) }),
      ...(body.reason        !== undefined && { reason: body.reason as string }),
    },
    include: { patient: { select: { id: true, name: true, phone: true, preferredLanguage: true } } },
  })
  return NextResponse.json(followUp)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await prisma.followUp.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
