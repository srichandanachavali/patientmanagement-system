// ── F062 · src/app/api/patients/[id]/attachments/route.ts
// Purpose: GET attachment list + POST upload → Vercel Blob (prod) or public/uploads/ (dev fallback)
// In: veda_session (F011), multipart file, patient id | Out: Attachment[] / 201 Attachment | See: F010, F011, F061, F148

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN

async function storeFile(
  patientId: string,
  safeName: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (USE_BLOB) {
    const { put } = await import('@vercel/blob')
    const blob = await put(`patients/${patientId}/${safeName}`, buffer, {
      access: 'public',
      contentType: mimeType,
    })
    return blob.url
  }

  // Local dev fallback — write to public/uploads/
  const { writeFile, mkdir } = await import('fs/promises')
  const path = await import('path')
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', patientId)
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, safeName), buffer)
  return `/uploads/${patientId}/${safeName}`
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const attachments = await prisma.attachment.findMany({
    where: { patientId: params.id },
    orderBy: { uploadedAt: 'desc' },
  })

  return NextResponse.json(
    attachments.map((a) => ({
      id: a.id,
      file_name: a.fileName,
      storage_path: a.storagePath,
      mime_type: a.mimeType,
      size_bytes: a.sizeBytes,
      category: a.category,
      uploaded_at: a.uploadedAt.toISOString(),
    })),
  )
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  let session: Awaited<ReturnType<typeof requireSession>>
  try { session = await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const patient = await prisma.patient.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  let formData: FormData
  try { formData = await request.formData() } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const VALID_CATEGORIES = ['XRAY', 'BEFORE', 'AFTER', 'REPORT', 'CONSENT', 'OTHER']
  const rawCategory = formData.get('category')
  const category = (typeof rawCategory === 'string' && VALID_CATEGORIES.includes(rawCategory))
    ? rawCategory
    : 'OTHER'

  const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 413 })
  }

  const safeName = `${Date.now()}_${file.name.replace(/[^a-z0-9._-]/gi, '_')}`
  const mimeType = file.type || 'application/octet-stream'
  const buffer = Buffer.from(await file.arrayBuffer())

  const storagePath = await storeFile(params.id, safeName, buffer, mimeType)

  const attachment = await prisma.attachment.create({
    data: {
      patientId: params.id,
      fileName: file.name,
      storagePath,
      mimeType,
      sizeBytes: file.size,
      category,
      uploadedById: session.userId,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'CREATE',
      entity: 'Attachment',
      entityId: attachment.id,
      metadata: JSON.stringify({ patientId: params.id, fileName: file.name }),
    },
  })

  return NextResponse.json(
    {
      id: attachment.id,
      file_name: attachment.fileName,
      storage_path: attachment.storagePath,
      mime_type: attachment.mimeType,
      size_bytes: attachment.sizeBytes,
      category: attachment.category,
      uploaded_at: attachment.uploadedAt.toISOString(),
    },
    { status: 201 },
  )
}
