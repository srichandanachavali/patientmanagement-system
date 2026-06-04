// ── prisma/seed.production.ts
// Purpose: Production seed — VEDA clinic config + staff accounts only. NO demo patients.
// Run ONCE after first deploy: npx tsx prisma/seed.production.ts
// IMPORTANT: Change all passwords on first login.

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE THESE PASSWORDS before running. Use strong, unique values.
// Minimum 12 characters. Staff must change on first login.
// ─────────────────────────────────────────────────────────────────────────────
const STAFF = [
  {
    email: 'admin@vedadental.in',
    name: 'VEDA Admin',
    role: 'ADMIN',
    password: 'veda123',
  },
  {
    email: 'dentist@vedadental.in',
    name: 'Dr. VEDA Dentist',
    role: 'DENTIST',
    password: 'veda123',
  },
  {
    email: 'reception@vedadental.in',
    name: 'VEDA Reception',
    role: 'RECEPTIONIST',
    password: 'veda123',
  },
]

const CLINIC_HOURS = {
  mon: { open: '09:30', close: '21:00' },
  tue: { open: '09:30', close: '21:00' },
  wed: { open: '09:30', close: '21:00' },
  thu: { open: '09:30', close: '21:00' },
  fri: { open: '09:30', close: '21:00' },
  sat: { open: '09:30', close: '21:00' },
  sun: { open: '09:30', close: '13:00' },
}

async function main() {
  console.log('🌱 VEDA Dental PMS — production seed starting…')

  // ─── Guard: refuse to run if patients already exist ───────────────────────
  const patientCount = await prisma.patient.count()
  if (patientCount > 0) {
    console.error('❌ Patients already exist in this database. Aborting to avoid data loss.')
    console.error('   Run this script only on a fresh (empty) production database.')
    process.exit(1)
  }

  // ─── Clinic settings ──────────────────────────────────────────────────────
  await prisma.clinicSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'VEDA Super Speciality Dental Clinic',
      phone: '07660966674',
      address: 'VEDA Super Speciality Dental Clinic, Hyderabad, Telangana',
      gstRate: 18,
      chairCount: 3,
      hoursJson: JSON.stringify(CLINIC_HOURS),
      brandColor: '#0d9488',
      upiVpa: 'vedadental@upi',
      upiPayeeName: 'VEDA Super Speciality Dental Clinic',
    },
  })
  console.log('  ✓ Clinic settings created')

  // ─── Staff accounts ───────────────────────────────────────────────────────
  for (const staff of STAFF) {
    const passwordHash = await bcrypt.hash(staff.password, 12)
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: {
        email: staff.email,
        name: staff.name,
        role: staff.role,
        passwordHash,
      },
    })
    console.log(`  ✓ User created: ${staff.email} (${staff.role})`)
  }

  console.log('')
  console.log('✅ Production seed complete.')
  console.log('⚠️  IMPORTANT: Change all staff passwords on first login.')
  console.log('   admin@vedadental.in  /  dentist@vedadental.in  /  reception@vedadental.in')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
