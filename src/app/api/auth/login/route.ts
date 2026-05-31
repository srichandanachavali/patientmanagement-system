// ── F050 · src/app/api/auth/login/route.ts
// Purpose: POST /api/auth/login — bcrypt verify + iron-session save + veda_role plain cookie
// In: { email, password } JSON | Out: { ok, role } + sets veda_session + veda_role cookies | See: F010, F011, F013
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const session = await getSession()
  session.userId = user.id
  session.email  = user.email
  session.name   = user.name
  session.role   = user.role as 'ADMIN' | 'DENTIST' | 'RECEPTIONIST'
  await session.save()

  await prisma.auditLog.create({
    data: { actorId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id },
  }).catch(() => {})

  // Alongside the sealed session, set a plain non-httpOnly role cookie so middleware
  // can read the role without needing to unseal the session.
  const res = NextResponse.json({ ok: true, role: user.role })
  res.cookies.set('veda_role', user.role, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return res
}
