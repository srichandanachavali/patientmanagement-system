// ── F073 · src/app/api/settings/route.ts
// Purpose: GET ClinicSettings (singleton id=1, all roles) + PATCH update (Admin only)
// In: veda_session (F011) | Out: ClinicSettings (F026) | See: F010, F011, F026, F185

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

function serialize(s: {
  id: number; name: string; phone: string; address: string
  gstRate: number; chairCount: number; hoursJson: string
  brandColor: string; upiVpa: string; upiPayeeName: string
}) {
  return {
    id:             s.id,
    name:           s.name,
    phone:          s.phone,
    address:        s.address,
    gst_rate:       s.gstRate,
    chair_count:    s.chairCount,
    hours_json:     JSON.parse(s.hoursJson) as unknown,
    brand_color:    s.brandColor,
    upi_vpa:        s.upiVpa,
    upi_payee_name: s.upiPayeeName,
  }
}

export async function GET() {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.clinicSettings.findFirst({ where: { id: 1 } })
  if (!settings) return NextResponse.json({ error: 'Settings not initialised' }, { status: 404 })

  return NextResponse.json(serialize(settings))
}

export async function PATCH(request: Request) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden — Admin only' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    name, phone, address, gst_rate, chair_count,
    hours_json, brand_color, upi_vpa, upi_payee_name,
  } = body

  const updated = await prisma.clinicSettings.update({
    where: { id: 1 },
    data: {
      ...(typeof name  === 'string' && name.trim()  ? { name:  name.trim()  } : {}),
      ...(typeof phone === 'string' && phone.trim() ? { phone: phone.trim() } : {}),
      ...(typeof address        === 'string' ? { address }                        : {}),
      ...(typeof gst_rate       === 'number' ? { gstRate: gst_rate }              : {}),
      ...(typeof chair_count    === 'number' ? { chairCount: chair_count }        : {}),
      ...(hours_json !== undefined            ? { hoursJson: JSON.stringify(hours_json) } : {}),
      ...(typeof brand_color    === 'string' ? { brandColor: brand_color }        : {}),
      ...(typeof upi_vpa        === 'string' ? { upiVpa: upi_vpa }               : {}),
      ...(typeof upi_payee_name === 'string' ? { upiPayeeName: upi_payee_name }  : {}),
    },
  })

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'UPDATE', entity: 'ClinicSettings', entityId: '1' },
  }).catch(() => {})

  return NextResponse.json(serialize(updated))
}
