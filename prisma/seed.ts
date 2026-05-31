import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'VEDADemo2026!'

const CLINIC_HOURS = {
  mon: { open: '09:30', close: '21:00' },
  tue: { open: '09:30', close: '21:00' },
  wed: { open: '09:30', close: '21:00' },
  thu: { open: '09:30', close: '21:00' },
  fri: { open: '09:30', close: '21:00' },
  sat: { open: '09:30', close: '21:00' },
  sun: { open: '09:30', close: '13:00' },
}

function istToUtc(y: number, m: number, d: number, hh: number, mm: number): Date {
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - 5.5 * 60 * 60 * 1000)
}

function daysFromToday(n: number) {
  const t = new Date()
  t.setDate(t.getDate() + n)
  return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() }
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

async function main() {
  console.log('🌱 Seeding VEDA Dental PMS…')

  // ─── Reset ───────────────────────────────────────────────────────────
  await prisma.auditLog.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoiceLine.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.procedure.deleteMany()
  await prisma.treatmentPlan.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.labCase.deleteMany()
  await prisma.clinicalNote.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.toothRecord.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.consent.deleteMany()
  await prisma.medicalHistory.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.user.deleteMany()
  await prisma.clinicSettings.deleteMany()

  // ─── Clinic settings ─────────────────────────────────────────────────
  await prisma.clinicSettings.create({
    data: {
      id: 1,
      name: 'VEDA Super Speciality Dental Clinic',
      phone: '07660966674',
      address:
        '43-6/18-24, Andhra Prabha Colony Rd, beside Sai Baba Temple, Nandamuri Nagar, PNT Colony, Vijayawada, AP 520015',
      gstRate: 18,
      chairCount: 3,
      hoursJson: JSON.stringify(CLINIC_HOURS),
      brandColor: '#0d9488',
      upiVpa: 'vedadental@upi',
      upiPayeeName: 'VEDA Super Speciality Dental Clinic',
    },
  })

  // ─── Users ───────────────────────────────────────────────────────────
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10)
  const [admin, drRamesh, drPriya, reception] = await Promise.all([
    prisma.user.create({ data: { email: 'admin@vedadental.in',       passwordHash: hash, name: 'Sushma Rao',         role: 'ADMIN' } }),
    prisma.user.create({ data: { email: 'dr.ramesh@vedadental.in',   passwordHash: hash, name: 'Dr. Ramesh Kumar',   role: 'DENTIST' } }),
    prisma.user.create({ data: { email: 'dr.priya@vedadental.in',    passwordHash: hash, name: 'Dr. Priya Reddy',    role: 'DENTIST' } }),
    prisma.user.create({ data: { email: 'reception@vedadental.in',   passwordHash: hash, name: 'Lakshmi Devi',       role: 'RECEPTIONIST' } }),
  ])
  const dentists = [drRamesh, drPriya]

  // ─── Patients ────────────────────────────────────────────────────────
  type PtSeed = { name: string; phone: string; email?: string; age: number; gender: string; lang: string; allergies: string[]; abha?: string }
  const patientSeeds: PtSeed[] = [
    // 0 – 14: active patients
    { name: 'Anjali Reddy',       phone: '9848012345', email: 'anjali.r@example.in',   age: 28, gender: 'Female', lang: 'te', allergies: ['Penicillin'],  abha: '14-1234-5678-9001' },
    { name: 'Vikram Naidu',       phone: '9848023456',                                  age: 45, gender: 'Male',   lang: 'te', allergies: [],              abha: '14-1234-5678-9002' },
    { name: 'Lakshmi Prasanna',   phone: '9848034567', email: 'lakshmi.p@example.in',  age: 34, gender: 'Female', lang: 'te', allergies: ['Latex'] },
    { name: 'Suresh Babu',        phone: '9848045678',                                  age: 52, gender: 'Male',   lang: 'te', allergies: [],              abha: '14-1234-5678-9003' },
    { name: 'Padma Sri',          phone: '9848056789', email: 'padma.s@example.in',    age: 41, gender: 'Female', lang: 'en', allergies: [] },
    { name: 'Ravi Teja',          phone: '9848067890',                                  age: 31, gender: 'Male',   lang: 'en', allergies: ['Aspirin'],     abha: '14-1234-5678-9004' },
    { name: 'Sirisha Kumari',     phone: '9848078901', email: 'sirisha.k@example.in',  age: 26, gender: 'Female', lang: 'te', allergies: [],              abha: '14-1234-5678-9005' },
    { name: 'Krishna Murthy',     phone: '9848089012',                                  age: 67, gender: 'Male',   lang: 'te', allergies: ['Sulfa'] },
    { name: 'Divya Bharathi',     phone: '9848090123', email: 'divya.b@example.in',    age: 22, gender: 'Female', lang: 'en', allergies: [],              abha: '14-1234-5678-9006' },
    { name: 'Mahesh Chowdary',    phone: '9848101234',                                  age: 38, gender: 'Male',   lang: 'te', allergies: [],              abha: '14-1234-5678-9007' },
    { name: 'Bhavana Sai',        phone: '9848112345', email: 'bhavana.s@example.in',  age: 7,  gender: 'Female', lang: 'te', allergies: [] },
    { name: 'Arjun Sharma',       phone: '9848123456',                                  age: 11, gender: 'Male',   lang: 'en', allergies: ['Ibuprofen'],   abha: '14-1234-5678-9008' },
    { name: 'Saritha Devi',       phone: '9848134567', email: 'saritha.d@example.in',  age: 55, gender: 'Female', lang: 'te', allergies: ['Penicillin'],  abha: '14-1234-5678-9009' },
    { name: 'Naveen Kumar',       phone: '9848145678',                                  age: 29, gender: 'Male',   lang: 'en', allergies: [] },
    { name: 'Kavitha Rani',       phone: '9848156789', email: 'kavitha.r@example.in',  age: 36, gender: 'Female', lang: 'te', allergies: [],              abha: '14-1234-5678-9010' },
    // 15 – 18: churned patients — last visit 7+ months ago, no future appt → recall due
    { name: 'Venkata Rao',        phone: '9848167890',                                  age: 48, gender: 'Male',   lang: 'te', allergies: [] },
    { name: 'Usha Rani',          phone: '9848178901', email: 'usha.r@example.in',     age: 35, gender: 'Female', lang: 'en', allergies: [] },
    { name: 'Subramanyam Naidu',  phone: '9848189012',                                  age: 62, gender: 'Male',   lang: 'te', allergies: [] },
    { name: 'Meena Kumari',       phone: '9848190123', email: 'meena.k@example.in',    age: 29, gender: 'Female', lang: 'en', allergies: [] },
  ]

  const patients = await Promise.all(
    patientSeeds.map((p) => {
      const dob = new Date()
      dob.setFullYear(dob.getFullYear() - p.age)
      dob.setMonth(Math.floor(Math.random() * 12))
      dob.setDate(1 + Math.floor(Math.random() * 28))
      return prisma.patient.create({
        data: {
          name: p.name, phone: p.phone, email: p.email,
          dob, gender: p.gender,
          address: 'Vijayawada, Andhra Pradesh',
          abhaNumber: (p as { abha?: string }).abha,
          preferredLanguage: p.lang,
          emergencyContact: `9848${Math.floor(100000 + Math.random() * 900000)}`,
          medicalHistory: {
            create: {
              conditions:  JSON.stringify(p.age > 50 ? ['Hypertension'] : []),
              medications:  JSON.stringify(p.age > 50 ? ['Amlodipine 5mg'] : []),
              allergies:    JSON.stringify(p.allergies),
              notes: p.allergies.length > 0 ? 'Verify allergy at every visit.' : null,
            },
          },
          consents: {
            create: [
              { scope: 'CLINICAL' },
              { scope: 'BILLING' },
              ...(Math.random() > 0.25 ? [{ scope: 'REMINDERS' }] : []),
            ],
          },
        },
      })
    }),
  )

  // ─── Appointments ─────────────────────────────────────────────────────
  type ApptSeed = {
    dayOffset: number; hh: number; mm: number; durMin: number
    chair: number; patientIdx: number; dentistIdx: number
    status: string; notes?: string
  }

  const apptSeeds: ApptSeed[] = [
    // ── Past (completed / no-show) ──
    { dayOffset: -7,  hh: 10, mm: 0,  durMin: 45, chair: 1, patientIdx: 0,  dentistIdx: 0, status: 'COMPLETED', notes: 'Scaling + polishing done' },
    { dayOffset: -7,  hh: 11, mm: 30, durMin: 60, chair: 2, patientIdx: 1,  dentistIdx: 1, status: 'COMPLETED', notes: 'Root canal session 1' },
    { dayOffset: -6,  hh: 14, mm: 0,  durMin: 30, chair: 1, patientIdx: 2,  dentistIdx: 0, status: 'COMPLETED', notes: 'Composite filling 36-O' },
    { dayOffset: -5,  hh: 16, mm: 0,  durMin: 45, chair: 3, patientIdx: 3,  dentistIdx: 1, status: 'NO_SHOW' },
    { dayOffset: -4,  hh: 10, mm: 30, durMin: 60, chair: 2, patientIdx: 4,  dentistIdx: 0, status: 'COMPLETED', notes: 'Crown cementation 26' },
    { dayOffset: -3,  hh: 15, mm: 0,  durMin: 30, chair: 1, patientIdx: 5,  dentistIdx: 1, status: 'COMPLETED', notes: 'Extraction 48' },
    { dayOffset: -2,  hh: 11, mm: 0,  durMin: 45, chair: 2, patientIdx: 6,  dentistIdx: 0, status: 'COMPLETED', notes: 'Consultation + X-ray' },
    { dayOffset: -1,  hh: 17, mm: 0,  durMin: 30, chair: 3, patientIdx: 7,  dentistIdx: 1, status: 'COMPLETED', notes: 'Denture adjustment' },
    // ── Today ──
    { dayOffset: 0,   hh: 10, mm: 0,  durMin: 30, chair: 1, patientIdx: 8,  dentistIdx: 0, status: 'CONFIRMED' },
    { dayOffset: 0,   hh: 11, mm: 0,  durMin: 60, chair: 2, patientIdx: 9,  dentistIdx: 1, status: 'CONFIRMED', notes: 'RCT 36 session 2' },
    { dayOffset: 0,   hh: 14, mm: 30, durMin: 45, chair: 1, patientIdx: 10, dentistIdx: 0, status: 'BOOKED',    notes: 'Pediatric check-up' },
    { dayOffset: 0,   hh: 16, mm: 0,  durMin: 30, chair: 3, patientIdx: 11, dentistIdx: 1, status: 'BOOKED' },
    { dayOffset: 0,   hh: 18, mm: 0,  durMin: 60, chair: 2, patientIdx: 12, dentistIdx: 0, status: 'BOOKED',    notes: 'Implant consultation' },
    // ── Tomorrow ──
    { dayOffset: 1,   hh: 10, mm: 0,  durMin: 30, chair: 1, patientIdx: 13, dentistIdx: 1, status: 'BOOKED' },
    { dayOffset: 1,   hh: 11, mm: 30, durMin: 45, chair: 2, patientIdx: 14, dentistIdx: 0, status: 'BOOKED' },
    { dayOffset: 1,   hh: 15, mm: 0,  durMin: 30, chair: 3, patientIdx: 0,  dentistIdx: 1, status: 'BOOKED',    notes: 'Follow-up' },
    // ── Later this week ──
    { dayOffset: 3,   hh: 10, mm: 30, durMin: 60, chair: 1, patientIdx: 2,  dentistIdx: 0, status: 'BOOKED' },
    { dayOffset: 4,   hh: 14, mm: 0,  durMin: 45, chair: 2, patientIdx: 5,  dentistIdx: 1, status: 'BOOKED' },
    { dayOffset: 5,   hh: 16, mm: 0,  durMin: 30, chair: 1, patientIdx: 8,  dentistIdx: 0, status: 'BOOKED' },
    { dayOffset: 6,   hh: 11, mm: 0,  durMin: 60, chair: 3, patientIdx: 12, dentistIdx: 1, status: 'BOOKED',    notes: 'Implant placement' },
    // ── Churned patients — last visit 7+ months ago (triggers recall) ──
    { dayOffset: -210, hh: 10, mm: 0,  durMin: 30, chair: 1, patientIdx: 15, dentistIdx: 0, status: 'COMPLETED', notes: 'Annual check-up' },
    { dayOffset: -215, hh: 11, mm: 0,  durMin: 45, chair: 2, patientIdx: 16, dentistIdx: 1, status: 'COMPLETED', notes: 'Scaling done' },
    { dayOffset: -220, hh: 14, mm: 0,  durMin: 30, chair: 3, patientIdx: 17, dentistIdx: 0, status: 'COMPLETED', notes: 'Composite filling' },
    { dayOffset: -225, hh: 15, mm: 30, durMin: 60, chair: 1, patientIdx: 18, dentistIdx: 1, status: 'COMPLETED', notes: 'Root canal completed' },
  ]

  const appointments = await Promise.all(
    apptSeeds.map((a) => {
      const day = daysFromToday(a.dayOffset)
      const start = istToUtc(day.y, day.m, day.d, a.hh, a.mm)
      const end = new Date(start.getTime() + a.durMin * 60 * 1000)
      return prisma.appointment.create({
        data: {
          patientId: patients[a.patientIdx].id,
          dentistId: dentists[a.dentistIdx].id,
          chair: a.chair, start, end,
          status: a.status,
          notes: a.notes ?? null,
        },
      })
    }),
  )

  // ─── Tooth records ────────────────────────────────────────────────────
  await Promise.all([
    prisma.toothRecord.create({ data: { patientId: patients[0].id, toothFdi: 36, status: 'CARIES',  surface: 'O', notedById: drRamesh.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[0].id, toothFdi: 16, status: 'FILLED',  surface: 'O', notedById: drRamesh.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[1].id, toothFdi: 46, status: 'RCT',     surface: null, notedById: drRamesh.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[1].id, toothFdi: 26, status: 'CROWN',   surface: null, notedById: drRamesh.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[2].id, toothFdi: 36, status: 'FILLED',  surface: 'O', notedById: drRamesh.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[3].id, toothFdi: 48, status: 'MISSING', surface: null, notedById: drPriya.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[3].id, toothFdi: 47, status: 'IMPLANT', surface: null, notedById: drPriya.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[4].id, toothFdi: 26, status: 'CROWN',   surface: null, notedById: drRamesh.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[5].id, toothFdi: 48, status: 'MISSING', surface: null, notedById: drPriya.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[10].id,toothFdi: 54, status: 'CARIES',  surface: 'O', notedById: drRamesh.id } }),
    prisma.toothRecord.create({ data: { patientId: patients[11].id,toothFdi: 75, status: 'FILLED',  surface: 'O', notedById: drPriya.id } }),
  ])

  // ─── Treatment plans ──────────────────────────────────────────────────
  await prisma.treatmentPlan.create({
    data: {
      patientId: patients[1].id,
      title: 'Full mouth rehabilitation',
      status: 'IN_PROGRESS',
      procedures: {
        create: [
          { toothFdi: 46, description: 'Root canal treatment',   costEstimate: 7500,  status: 'COMPLETED', phase: 1, completedAt: new Date() },
          { toothFdi: 46, description: 'Post & core + crown',    costEstimate: 8500,  status: 'PLANNED',   phase: 2 },
          { toothFdi: 36, description: 'Composite filling',      costEstimate: 1500,  status: 'PROPOSED',  phase: 1 },
        ],
      },
    },
  })

  await prisma.treatmentPlan.create({
    data: {
      patientId: patients[3].id,
      title: 'Posterior implant restoration',
      status: 'ACCEPTED',
      procedures: {
        create: [
          { toothFdi: 47, description: 'Implant placement', costEstimate: 28000, status: 'COMPLETED', phase: 1, completedAt: new Date() },
          { toothFdi: 47, description: 'Implant crown',     costEstimate: 12000, status: 'PLANNED',   phase: 2 },
        ],
      },
    },
  })

  await prisma.treatmentPlan.create({
    data: {
      patientId: patients[10].id,
      title: 'Pediatric caries management',
      status: 'PROPOSED',
      procedures: {
        create: [
          { toothFdi: 54, description: 'Pulpotomy + stainless steel crown', costEstimate: 3500, status: 'PROPOSED', phase: 1 },
        ],
      },
    },
  })

  // ─── Invoices + payments ──────────────────────────────────────────────
  const lineTotal = (lines: { amount: number; taxRate: number }[]) =>
    lines.reduce((s, l) => s + l.amount * (1 + l.taxRate / 100), 0)

  // Invoice 1 — Anjali — Paid today
  const inv1Lines = [{ description: 'Scaling & polishing', amount: 2000, taxRate: 18 }]
  const inv1 = await prisma.invoice.create({
    data: { patientId: patients[0].id, issuedAt: daysAgo(7), status: 'PAID', createdById: admin.id, lines: { create: inv1Lines } },
  })
  await prisma.payment.create({
    data: { invoiceId: inv1.id, amount: lineTotal(inv1Lines), mode: 'UPI', recordedById: admin.id, reference: 'UPI/100001', paidAt: new Date() },
  })

  // Invoice 2 — Vikram — Partially Paid (3 days ago)
  const inv2Lines = [{ description: 'Root canal treatment — 46 (session 1)', amount: 5000, taxRate: 18 }]
  const inv2 = await prisma.invoice.create({
    data: { patientId: patients[1].id, issuedAt: daysAgo(7), status: 'PARTIALLY_PAID', createdById: admin.id, lines: { create: inv2Lines } },
  })
  await prisma.payment.create({
    data: { invoiceId: inv2.id, amount: 3000, mode: 'CASH', recordedById: admin.id, paidAt: daysAgo(3) },
  })

  // Invoice 3 — Lakshmi — Paid (2 days ago)
  const inv3Lines = [{ description: 'Composite filling — 36-O', amount: 1500, taxRate: 18 }]
  const inv3 = await prisma.invoice.create({
    data: { patientId: patients[2].id, issuedAt: daysAgo(6), status: 'PAID', createdById: admin.id, lines: { create: inv3Lines } },
  })
  await prisma.payment.create({
    data: { invoiceId: inv3.id, amount: lineTotal(inv3Lines), mode: 'CARD', recordedById: admin.id, reference: 'AUTH-882910', paidAt: daysAgo(2) },
  })

  // Invoice 4 — Padma — Paid (4 days ago)
  const inv4Lines = [
    { description: 'Crown cementation — 26', amount: 8000, taxRate: 18 },
    { description: 'Crown adjustment',        amount: 500,  taxRate: 18 },
  ]
  const inv4 = await prisma.invoice.create({
    data: { patientId: patients[4].id, issuedAt: daysAgo(4), status: 'PAID', createdById: admin.id, lines: { create: inv4Lines } },
  })
  await prisma.payment.create({
    data: { invoiceId: inv4.id, amount: lineTotal(inv4Lines), mode: 'UPI', recordedById: admin.id, reference: 'UPI/100002', paidAt: daysAgo(4) },
  })

  // Invoice 5 — Ravi — Sent, unpaid
  await prisma.invoice.create({
    data: {
      patientId: patients[5].id, issuedAt: daysAgo(3), status: 'SENT', createdById: admin.id,
      lines: { create: [{ description: 'Extraction — 48', amount: 1200, taxRate: 18 }] },
    },
  })

  // Invoice 6 — Suresh — Partially Paid (5 days ago)
  const inv6Lines = [{ description: 'Implant placement — 47', amount: 28000, taxRate: 18 }]
  const inv6 = await prisma.invoice.create({
    data: { patientId: patients[3].id, issuedAt: daysAgo(5), status: 'PARTIALLY_PAID', createdById: admin.id, lines: { create: inv6Lines } },
  })
  await prisma.payment.create({
    data: { invoiceId: inv6.id, amount: 15000, mode: 'UPI', recordedById: admin.id, reference: 'UPI/100003', paidAt: daysAgo(5) },
  })

  // ─── Clinical notes ───────────────────────────────────────────────────
  await prisma.clinicalNote.create({
    data: {
      patientId: patients[1].id, appointmentId: appointments[1].id, authorId: drRamesh.id,
      body: 'CC: Pain on lower right molar. O/E: Deep caries 46 with pulpal involvement. Plan: Endo treatment, 3 sessions. Started access opening today, calcium hydroxide dressing placed. Pt advised soft diet.',
    },
  })
  await prisma.clinicalNote.create({
    data: {
      patientId: patients[2].id, appointmentId: appointments[2].id, authorId: drRamesh.id,
      body: 'CC: Sensitivity on lower left. O/E: Class I caries 36-O. LA given (2% lidocaine with epi). Caries excavated, composite restoration placed. Occlusion checked, finishing & polishing done.',
    },
  })

  // ─── Prescription ─────────────────────────────────────────────────────
  await prisma.prescription.create({
    data: {
      patientId: patients[1].id, appointmentId: appointments[1].id, prescribedById: drRamesh.id,
      items: JSON.stringify([
        { drug: 'Amoxicillin 500mg',  dosage: '1 cap', frequency: 'TID', durationDays: 5, instructions: 'After meals' },
        { drug: 'Ibuprofen 400mg',    dosage: '1 tab', frequency: 'TID', durationDays: 3, instructions: 'SOS for pain' },
        { drug: 'Chlorhexidine 0.2%', dosage: '10 ml', frequency: 'BID', durationDays: 7, instructions: 'Mouthwash, 1 min' },
      ]),
      notes: 'Review in 1 week for RCT session 2.',
    },
  })

  // ─── Audit log ───────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { actorId: admin.id,    action: 'LOGIN',  entity: 'User',    entityId: admin.id },
      { actorId: drRamesh.id, action: 'CREATE', entity: 'Patient', entityId: patients[0].id },
      { actorId: drRamesh.id, action: 'VIEW',   entity: 'Patient', entityId: patients[1].id },
    ],
  })

  console.log(`✅ Seeded:
  4 users — all password: ${DEMO_PASSWORD}
  ${patients.length} patients (15 active + 4 churned for recall demo)
  ${appointments.length} appointments
  3 treatment plans · 6 invoices · 1 prescription · 2 clinical notes
  Login: admin@vedadental.in / ${DEMO_PASSWORD}
`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
