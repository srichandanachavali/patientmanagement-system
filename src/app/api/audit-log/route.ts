// ── F074 · src/app/api/audit-log/route.ts
// Purpose: GET paginated AuditLog entries newest-first with actor name/role
// In: veda_session (F011), ?page=N | Out: { logs, total, page, pages } | See: F010, F011, F186

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function GET(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const take = 50
  const skip = (page - 1) * take

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.auditLog.count(),
  ])

  return NextResponse.json({
    logs: logs.map((l) => ({
      id:         l.id,
      actor:      l.actor,
      action:     l.action,
      entity:     l.entity,
      entity_id:  l.entityId,
      metadata:   l.metadata,
      created_at: l.createdAt.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / take),
  })
}
