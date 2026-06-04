// ── F081 · src/app/api/odontogram/[patientId]/[fdi]/route.ts
// Purpose: PUT upsert tooth record (append-only history; latest by createdAt wins in UI) — accepts status, surface, findings
// In: veda_session (F011), Prisma ToothRecord (F002) | Out: 200 { ok: true } | See: F010, F011, F162, F160
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

export async function PUT(
  request: Request,
  { params }: { params: { patientId: string; fdi: string } },
) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, surface, findings } = body as {
    status:   string
    surface:  string | null
    findings?: string[]
  }
  if (!status) return NextResponse.json({ error: 'status is required' }, { status: 400 })

  const fdiNum = Number(params.fdi)
  if (!Number.isInteger(fdiNum) || fdiNum < 11 || fdiNum > 85) {
    return NextResponse.json({ error: 'Invalid FDI number' }, { status: 400 })
  }

  await prisma.toothRecord.create({
    data: {
      patientId:  params.patientId,
      toothFdi:   fdiNum,
      status,
      surface:    surface ?? null,
      findings:   JSON.stringify(Array.isArray(findings) ? findings : []),
      notedById:  session.userId,
    },
  })

  return NextResponse.json({ ok: true })
}
