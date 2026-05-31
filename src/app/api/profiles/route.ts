// ── F076 · src/app/api/profiles/route.ts
// Purpose: GET users filtered by ?role= for dropdowns (e.g. ?role=DENTIST for appointment form)
// In: veda_session (F011), Prisma User (F002) | Out: { id, name, role }[] | See: F010, F011, F151
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')?.toUpperCase()

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}
