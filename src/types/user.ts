// ── F021 · src/types/user.ts
// Purpose: UserRole union + User interface
// In: — | Out: UserRole, User | See: F031, F050
export type UserRole = 'Admin' | 'Dentist' | 'Assistant' | 'Receptionist'

export interface User {
  id: string
  name: string
  role: UserRole
}
