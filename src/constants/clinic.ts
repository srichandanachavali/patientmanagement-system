// ── F030 · src/constants/clinic.ts
// Purpose: Clinic-wide constants — name, phone, address, hours, chair config, GST rates, DPDP version
// In: ClinicHours (F026) | Out: CLINIC_NAME, CLINIC_PHONE, CLINIC_ADDRESS, CLINIC_HOURS, CHAIR_COUNT, CHAIR_IDS, GST_DEFAULT_RATE, GST_EXEMPTED_RATE, SLOT_MINUTES, DPDP_NOTICE_VERSION | See: F026
import type { ClinicHours } from '@/types'

export const CLINIC_NAME = 'VEDA Super Speciality Dental Clinic'
export const CLINIC_PHONE = '07660966674'
export const CLINIC_ADDRESS = 'Vijayawada, Andhra Pradesh 520015'

export const CLINIC_HOURS: ClinicHours = {
  mon: { open: '09:30', close: '21:00' },
  tue: { open: '09:30', close: '21:00' },
  wed: { open: '09:30', close: '21:00' },
  thu: { open: '09:30', close: '21:00' },
  fri: { open: '09:30', close: '21:00' },
  sat: { open: '09:30', close: '21:00' },
  sun: { open: '09:30', close: '13:00' },
}

export const CHAIR_COUNT = 3
export const CHAIR_IDS = [1, 2, 3] as const

export const GST_DEFAULT_RATE = 18
export const GST_EXEMPTED_RATE = 0

// Slot granularity in minutes for the scheduler
export const SLOT_MINUTES = 15

export const DPDP_NOTICE_VERSION = '1.0'
