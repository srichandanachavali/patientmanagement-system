// ── F051 · src/app/api/auth/logout/route.ts
// Purpose: POST /api/auth/logout — writes audit log, destroys session, clears veda_role cookie
// In: veda_session cookie | Out: { ok } + clears cookies | See: F010, F011, F050
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await getSession()

  if (session.userId) {
    await prisma.auditLog.create({
      data: { actorId: session.userId, action: 'LOGOUT', entity: 'User', entityId: session.userId },
    }).catch(() => {})
  }

  session.destroy()

  const res = NextResponse.json({ ok: true })
  res.cookies.delete('veda_role')
  return res
}
