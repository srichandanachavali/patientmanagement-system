// ── F011 · src/lib/session.ts
// Purpose: iron-session config + getSession / requireSession helpers
// In: SESSION_PASSWORD (env, min 32 chars) | Out: getSession, requireSession, SessionData | See: F004, F013, F050
import { cookies } from 'next/headers'
import { getIronSession, type SessionOptions } from 'iron-session'

export interface SessionData {
  userId?: string
  email?: string
  name?: string
  role?: 'ADMIN' | 'DENTIST' | 'RECEPTIONIST'
}

const password = process.env.SESSION_PASSWORD
if (!password || password.length < 32) {
  throw new Error(
    'SESSION_PASSWORD must be set and at least 32 characters. See .env.example.',
  )
}

export const sessionOptions: SessionOptions = {
  password,
  cookieName: 'veda_session',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  },
}

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions)
}

export async function requireSession() {
  const session = await getSession()
  if (!session.userId) throw new Error('Unauthorized')
  return session as Required<SessionData> & Awaited<ReturnType<typeof getSession>>
}
