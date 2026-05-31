// ── F061 · src/app/api/patients/[id]/route.ts
// Purpose: GET detail + PATCH update + DELETE DPDP soft-erase (anonymise PII, withdraw consents)
// In: veda_session (F011), patient id param | Out: PatientDetail / { ok } | See: F010, F011, F022, F060, F062
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

function parseArr(s: string): string[] {
  try { return JSON.parse(s) } catch { return [] }
}

function serializeDetail(p: Awaited<ReturnType<typeof fetchPatient>>) {
  if (!p) return null
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
    medical_history: p.medicalHistory
      ? {
          conditions: parseArr(p.medicalHistory.conditions),
          medications: parseArr(p.medicalHistory.medications),
          allergies: parseArr(p.medicalHistory.allergies),
          notes: p.medicalHistory.notes,
        }
      : null,
    consents: p.consents.map((c) => ({
      scope: c.scope,
      granted_at: c.grantedAt.toISOString(),
      withdrawn_at: c.withdrawnAt?.toISOString() ?? null,
    })),
    attachments: p.attachments.map((a) => ({
      id: a.id,
      file_name: a.fileName,
      storage_path: a.storagePath,
      mime_type: a.mimeType,
      size_bytes: a.sizeBytes,
      uploaded_at: a.uploadedAt.toISOString(),
    })),
    recent_appointments: p.appointments.map((a) => ({
      id: a.id,
      start: a.start.toISOString(),
      status: a.status,
      dentist_name: a.dentist.name,
      chair: a.chair,
    })),
  }
}

async function fetchPatient(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      medicalHistory: true,
      consents: { orderBy: { grantedAt: 'desc' } },
      attachments: { orderBy: { uploadedAt: 'desc' } },
      appointments: {
        orderBy: { start: 'desc' },
        take: 5,
        include: { dentist: { select: { name: true } } },
      },
    },
  })
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const patient = await fetchPatient(params.id)
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'VIEW', entity: 'Patient', entityId: params.id },
  }).catch(() => {})

  return NextResponse.json(serializeDetail(patient))
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const existing = await prisma.patient.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const {
    name, phone, dob, gender, email, address, emergency_contact,
    abha_number, preferred_language, conditions, medications, allergies, notes,
  } = body as Record<string, unknown>

  await prisma.patient.update({
    where: { id: params.id },
    data: {
      ...(typeof name === 'string' && name.trim() ? { name: name.trim() } : {}),
      ...(typeof phone === 'string' && phone.trim() ? { phone: phone.trim() } : {}),
      ...(dob !== undefined ? { dob: dob ? new Date(dob as string) : null } : {}),
      ...(gender !== undefined ? { gender: (gender as string) || null } : {}),
      ...(email !== undefined ? { email: (email as string) || null } : {}),
      ...(address !== undefined ? { address: (address as string) || null } : {}),
      ...(emergency_contact !== undefined ? { emergencyContact: (emergency_contact as string) || null } : {}),
      ...(abha_number !== undefined ? { abhaNumber: (abha_number as string) || null } : {}),
      ...(preferred_language !== undefined ? { preferredLanguage: preferred_language as string } : {}),
    },
  })

  // Upsert medical history if any MH fields supplied
  const hasMh = [conditions, medications, allergies, notes].some((v) => v !== undefined)
  if (hasMh) {
    await prisma.medicalHistory.upsert({
      where: { patientId: params.id },
      create: {
        patientId: params.id,
        conditions: JSON.stringify(Array.isArray(conditions) ? conditions : []),
        medications: JSON.stringify(Array.isArray(medications) ? medications : []),
        allergies: JSON.stringify(Array.isArray(allergies) ? allergies : []),
        notes: (notes as string) || null,
      },
      update: {
        ...(conditions !== undefined ? { conditions: JSON.stringify(Array.isArray(conditions) ? conditions : []) } : {}),
        ...(medications !== undefined ? { medications: JSON.stringify(Array.isArray(medications) ? medications : []) } : {}),
        ...(allergies !== undefined ? { allergies: JSON.stringify(Array.isArray(allergies) ? allergies : []) } : {}),
        ...(notes !== undefined ? { notes: (notes as string) || null } : {}),
      },
    })
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'UPDATE',
      entity: 'Patient',
      entityId: params.id,
    },
  })

  const updated = await fetchPatient(params.id)
  return NextResponse.json(serializeDetail(updated))
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.patient.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // DPDP soft erase: withdraw all consents + anonymise PII
  await prisma.consent.updateMany({
    where: { patientId: params.id, withdrawnAt: null },
    data: { withdrawnAt: new Date() },
  })

  await prisma.patient.update({
    where: { id: params.id },
    data: {
      name: '[Erased]',
      phone: `erased_${params.id.slice(-8)}`,
      email: null,
      dob: null,
      gender: null,
      address: null,
      emergencyContact: null,
      abhaNumber: null,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'DELETE',
      entity: 'Patient',
      entityId: params.id,
      metadata: JSON.stringify({ reason: 'DPDP_ERASE_REQUEST' }),
    },
  })

  return NextResponse.json({ ok: true })
}
