// ── F206 · src/app/api/feedback/[id]/route.ts
// Purpose: GET single + DELETE feedback entry
// In: veda_session (F011), id param | Out: PatientFeedback | See: F010, F011, F205

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const feedback = await prisma.patientFeedback.findUnique({
    where: { id: params.id },
    include: { patient: { select: { id: true, name: true } } },
  })
  if (!feedback) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(feedback)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await prisma.patientFeedback.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
