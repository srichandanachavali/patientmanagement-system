// ── F142 · src/app/(app)/patients/[id]/page.tsx
// Purpose: Server Component — patient detail with allergy banner, MH, consents, attachments, appointments, lab cases
// In: Prisma (F010), AllergyBanner (F144), AttachmentUploader (F148), formatDate/formatTime (F012) | Out: PatientDetailPage | See: F010, F012, F061, F143, F144, F148, F070
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Phone, Mail, MapPin, User, ShieldCheck, CalendarDays,
  Paperclip, ChevronLeft, Pencil, CalendarPlus, Clock, FlaskConical, Plus,
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { cn, formatDate, formatTime } from '@/lib/utils'
import { AllergyBanner } from '@/components/patients/AllergyBanner'
import { AttachmentUploader } from '@/components/patients/AttachmentUploader'

function parseArr(s: string): string[] {
  try { return JSON.parse(s) } catch { return [] }
}

const SCOPE_LABEL: Record<string, string> = {
  CLINICAL: 'Clinical care',
  BILLING: 'Billing & invoicing',
  REMINDERS: 'Appointment reminders',
}

const STATUS_CLS: Record<string, string> = {
  BOOKED:    'bg-secondary text-secondary-foreground',
  CONFIRMED: 'bg-info/10 text-info',
  ARRIVED:   'bg-warning/10 text-warning',
  IN_CHAIR:  'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-success/10 text-success',
  NO_SHOW:   'bg-danger-bg text-danger',
  CANCELLED: 'bg-danger-bg/60 text-danger/70',
}

const LAB_STATUS_CLS: Record<string, string> = {
  'Planned':          'bg-secondary text-secondary-foreground',
  'Impression Taken': 'bg-info/15 text-info',
  'Sent to Lab':      'bg-warning/15 text-warning',
  'Received':         'bg-success/15 text-success',
  'Fitted/Delivered': 'bg-success/30 text-success',
}

const STATUS_LABEL: Record<string, string> = {
  BOOKED: 'Booked', CONFIRMED: 'Confirmed', ARRIVED: 'Arrived',
  IN_CHAIR: 'In Chair', COMPLETED: 'Completed', NO_SHOW: 'No Show', CANCELLED: 'Cancelled',
}

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      medicalHistory: true,
      consents: { orderBy: { grantedAt: 'desc' } },
      attachments: { orderBy: { uploadedAt: 'desc' } },
      appointments: {
        orderBy: { start: 'desc' },
        take: 5,
        include: { dentist: { select: { name: true } } },
      },
      labCases: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!patient || patient.name === '[Erased]') notFound()

  const allergies = patient.medicalHistory ? parseArr(patient.medicalHistory.allergies) : []
  const conditions = patient.medicalHistory ? parseArr(patient.medicalHistory.conditions) : []
  const medications = patient.medicalHistory ? parseArr(patient.medicalHistory.medications) : []

  const age = patient.dob
    ? Math.floor((Date.now() - new Date(patient.dob).getTime()) / 31_557_600_000)
    : null

  const activeConsents = patient.consents.filter((c) => !c.withdrawnAt)

  return (
    <div className="space-y-5">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/patients" className="flex items-center gap-1 hover:text-foreground">
            <ChevronLeft className="h-3.5 w-3.5" />
            Patients
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">{patient.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/appointments/new?patientId=${patient.id}`}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-surface"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Book
          </Link>
          <Link
            href={`/patients/${patient.id}/edit`}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* Allergy banner */}
      {allergies.length > 0 && <AllergyBanner allergies={allergies} />}

      {/* Patient header card */}
      <div className="rounded-lg border border-border bg-background p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{patient.name}</h2>
              {patient.preferredLanguage === 'te' && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                  తెలుగు
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {age !== null && <span>{age} yrs</span>}
              {patient.gender && <span>{patient.gender}</span>}
              {patient.dob && (
                <span>DOB: {new Date(patient.dob).toLocaleDateString('en-IN')}</span>
              )}
            </div>
          </div>
          {patient.abhaNumber && (
            <div className="flex items-center gap-1.5 rounded-md bg-info/5 px-3 py-2 text-xs text-info">
              <ShieldCheck className="h-4 w-4" />
              <div>
                <p className="font-medium">ABHA</p>
                <p className="font-mono">{patient.abhaNumber}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
          <a href={`tel:${patient.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            {patient.phone}
          </a>
          {patient.email && (
            <a href={`mailto:${patient.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              {patient.email}
            </a>
          )}
          {patient.address && (
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              {patient.address}
            </p>
          )}
          {patient.emergencyContact && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              Emergency: {patient.emergencyContact}
            </p>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">

        {/* Left column */}
        <div className="space-y-5">

          {/* Medical history */}
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">Medical History</h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: 'Allergies', items: allergies, danger: true },
                { label: 'Conditions', items: conditions, danger: false },
                { label: 'Medications', items: medications, danger: false },
              ].map(({ label, items, danger }) => (
                <div key={label} className="px-5 py-3">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">None recorded</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item) => (
                        <span
                          key={item}
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-medium',
                            danger
                              ? 'bg-danger-bg text-danger'
                              : 'bg-secondary text-secondary-foreground',
                          )}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {patient.medicalHistory?.notes && (
                <div className="px-5 py-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm text-foreground">{patient.medicalHistory.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent appointments */}
          <div className="rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">Recent Appointments</h3>
              <Link
                href={`/appointments?patientId=${patient.id}`}
                className="text-xs text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            {patient.appointments.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">No appointments yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {patient.appointments.map((appt) => (
                  <Link
                    key={appt.id}
                    href={`/appointments/${appt.id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-surface"
                  >
                    <div className="flex w-14 shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(appt.start.toISOString())}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(appt.start.toISOString())} · {appt.dentist.name}
                      </p>
                    </div>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium', STATUS_CLS[appt.status])}>
                      {STATUS_LABEL[appt.status] ?? appt.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">Attachments</h3>
              <p className="text-[11px] text-muted-foreground">X-rays, reports, consent forms</p>
            </div>
            <div className="p-5 space-y-4">
              <AttachmentUploader patientId={patient.id} />
              {patient.attachments.length > 0 && (
                <div className="divide-y divide-border rounded-md border border-border">
                  {patient.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.storagePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface"
                    >
                      <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">{att.fileName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(att.sizeBytes / 1024).toFixed(0)} KB · {formatDate(att.uploadedAt.toISOString())}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lab Cases */}
          <div className="rounded-lg border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Lab Cases</h3>
              </div>
              <Link
                href={`/lab/new?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}&patientPhone=${encodeURIComponent(patient.phone)}`}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="h-3 w-3" />
                New lab case
              </Link>
            </div>
            {patient.labCases.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">No lab cases yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {patient.labCases.map((lc) => {
                  const overdue =
                    lc.expectedAt &&
                    new Date(lc.expectedAt) < new Date() &&
                    lc.status !== 'Received' &&
                    lc.status !== 'Fitted/Delivered'
                  return (
                    <Link
                      key={lc.id}
                      href={`/lab/${lc.id}`}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-surface"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{lc.caseType}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {lc.toothNumbers ? `Teeth ${lc.toothNumbers}` : 'No teeth specified'}
                          {lc.labName && ` · ${lc.labName}`}
                          {lc.expectedAt && (
                            <span className={cn('ml-1', overdue ? 'text-danger font-semibold' : '')}>
                              · Due {new Date(lc.expectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' })}
                              {overdue ? ' ⚠' : ''}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className={cn(
                        'shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold',
                        LAB_STATUS_CLS[lc.status] ?? 'bg-secondary text-secondary-foreground',
                      )}>
                        {lc.status}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Consents */}
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">DPDP Consents</h3>
            </div>
            <div className="divide-y divide-border">
              {(['CLINICAL', 'BILLING', 'REMINDERS'] as const).map((scope) => {
                const granted = activeConsents.some((c) => c.scope === scope)
                return (
                  <div key={scope} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={cn('h-2 w-2 rounded-full shrink-0', granted ? 'bg-success' : 'bg-muted-foreground/30')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground">{SCOPE_LABEL[scope]}</p>
                    </div>
                    <span className={cn('text-[10px] font-medium', granted ? 'text-success' : 'text-muted-foreground')}>
                      {granted ? 'Granted' : 'Not granted'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Links</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { href: `/odontogram/${patient.id}`, label: 'Odontogram', Icon: CalendarDays },
                { href: `/billing?patientId=${patient.id}`, label: 'Billing', Icon: CalendarDays },
                { href: `/lab?patientId=${patient.id}`, label: 'Lab Cases', Icon: FlaskConical },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-surface"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Registered since */}
          <p className="text-center text-[11px] text-muted-foreground">
            Registered {formatDate(patient.createdAt.toISOString())}
          </p>

        </div>
      </div>
    </div>
  )
}
