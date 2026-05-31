// ── F023 · src/types/appointment.ts
// Purpose: AppointmentStatus union + Appointment interface
// In: — | Out: AppointmentStatus, Appointment | See: F031, F070
export type AppointmentStatus =
  | 'BOOKED'
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'IN_CHAIR'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED'

export interface Appointment {
  id: string
  patient_id: string
  dentist_id: string
  chair_id: number
  start: string
  end: string
  status: AppointmentStatus
  notes: string | null
}
