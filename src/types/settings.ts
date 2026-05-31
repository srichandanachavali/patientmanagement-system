// ── F026 · src/types/settings.ts
// Purpose: ClinicHours + ClinicSettings interfaces — matches prisma/schema.prisma ClinicSettings model
// In: — | Out: DayHours, ClinicHours, ClinicSettings | See: F030, F073, F185

export type DayHours = { open: string; close: string }

export type ClinicHours = {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}

export interface ClinicSettings {
  id: number
  name: string
  phone: string
  address: string
  gst_rate: number
  chair_count: number
  hours_json: ClinicHours
  brand_color: string
  upi_vpa: string
  upi_payee_name: string
}
