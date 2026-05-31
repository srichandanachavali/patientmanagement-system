// ── F143 · src/app/(app)/patients/[id]/edit/page.tsx
// Purpose: Server Component — reads Prisma, converts arrays to comma strings, passes defaultValues to EditPatientClient
// In: Prisma (F010), EditPatientClient (F149), PatientFormValues (F146) | Out: EditPatientPage | See: F010, F061, F149
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { EditPatientClient } from '@/components/patients/EditPatientClient'
import type { PatientFormValues } from '@/components/patients/PatientForm'

function parseArr(s: string): string[] {
  try { return JSON.parse(s) } catch { return [] }
}

export default async function EditPatientPage({ params }: { params: { id: string } }) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: { medicalHistory: true },
  })

  if (!patient || patient.name === '[Erased]') notFound()

  const mh = patient.medicalHistory
  const defaultValues: PatientFormValues = {
    name: patient.name,
    phone: patient.phone,
    dob: patient.dob ? patient.dob.toISOString().slice(0, 10) : '',
    gender: (patient.gender ?? '') as PatientFormValues['gender'],
    email: patient.email ?? '',
    address: patient.address ?? '',
    emergency_contact: patient.emergencyContact ?? '',
    abha_number: patient.abhaNumber ?? '',
    preferred_language: patient.preferredLanguage as PatientFormValues['preferred_language'],
    allergies: mh ? parseArr(mh.allergies).join(', ') : '',
    conditions: mh ? parseArr(mh.conditions).join(', ') : '',
    medications: mh ? parseArr(mh.medications).join(', ') : '',
    medical_notes: mh?.notes ?? '',
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/patients/${patient.id}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {patient.name}
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs font-medium text-foreground">Edit</span>
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground">Edit Patient</h2>
        <p className="text-xs text-muted-foreground">
          Updates are saved immediately. Consents can only be added — to withdraw, use the patient profile.
        </p>
      </div>

      <EditPatientClient patientId={patient.id} defaultValues={defaultValues} />
    </div>
  )
}
