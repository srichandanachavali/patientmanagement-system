// ── F060 · src/app/api/patients/route.ts
// Purpose: GET search (name/phone/ABHA) + POST create patient with MH + consents
// In: veda_session (F011), Prisma Patient model (F002) | Out: serialized Patient[] / 201 Patient | See: F010, F011, F022, F061
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

function parseArr(s: string): string[] {
  try { return JSON.parse(s) } catch { return [] }
}

function serializePatient(p: {
  id: string; name: string; phone: string; dob: Date | null; gender: string | null
  email: string | null; address: string | null; emergencyContact: string | null
  abhaNumber: string | null; preferredLanguage: string; createdAt: Date
  medicalHistory: { allergies: string } | null
}) {
  return {
    id: p.id,
    name: p.name,
    phone: p.phone,
    dob: p.dob?.toISOString() ?? null,
    gender: p.gender,
    email: p.email,
    address: p.address,
    emergency_contact: p.emergencyContact,
    abha_number: p.abhaNumber,
    preferred_language: p.preferredLanguage,
    created_at: p.createdAt.toISOString(),
    medical_histories: p.medicalHistory
      ? [{ allergies: parseArr(p.medicalHistory.allergies) }]
      : null,
  }
}

export async function GET(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
          { abhaNumber: { contains: q } },
        ],
      }
    : undefined

  const patients = await prisma.patient.findMany({
    where,
    include: { medicalHistory: { select: { allergies: true } } },
    orderBy: { name: 'asc' },
    take: 100,
  })

  return NextResponse.json(patients.map(serializePatient))
}

export async function POST(request: Request) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    name, phone, dob, gender, email, address, emergency_contact,
    abha_number, preferred_language, conditions, medications,
    allergies, notes, consent_scopes,
  } = body as Record<string, unknown>

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }
  if (typeof phone !== 'string' || !phone.trim()) {
    return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
  }

  const existing = await prisma.patient.findFirst({ where: { phone: (phone as string).trim() } })
  if (existing) {
    return NextResponse.json(
      { error: 'A patient with this phone number already exists.' },
      { status: 409 },
    )
  }

  const rawScopes = Array.isArray(consent_scopes) ? consent_scopes as string[] : ['CLINICAL']
  const normScopes = rawScopes
    .map((s) => String(s).toUpperCase())
    .filter((s) => ['CLINICAL', 'BILLING', 'REMINDERS'].includes(s))
  if (!normScopes.includes('CLINICAL')) normScopes.push('CLINICAL')

  const patient = await prisma.patient.create({
    data: {
      name: (name as string).trim(),
      phone: (phone as string).trim(),
      dob: dob ? new Date(dob as string) : null,
      gender: (gender as string) || null,
      email: (email as string) || null,
      address: (address as string) || null,
      emergencyContact: (emergency_contact as string) || null,
      abhaNumber: (abha_number as string) || null,
      preferredLanguage: (preferred_language as string) || 'en',
      medicalHistory: {
        create: {
          conditions: JSON.stringify(Array.isArray(conditions) ? conditions : []),
          medications: JSON.stringify(Array.isArray(medications) ? medications : []),
          allergies: JSON.stringify(Array.isArray(allergies) ? allergies : []),
          notes: (notes as string) || null,
        },
      },
      consents: {
        create: normScopes.map((scope) => ({ scope })),
      },
    },
    include: { medicalHistory: { select: { allergies: true } } },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'CREATE',
      entity: 'Patient',
      entityId: patient.id,
    },
  })

  return NextResponse.json(serializePatient(patient), { status: 201 })
}
