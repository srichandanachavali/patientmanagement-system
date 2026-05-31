// ── F101 · src/app/(auth)/layout.tsx
// Purpose: Centered card layout wrapper for login page
// In: — | Out: AuthLayout | See: F110
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      {children}
    </div>
  )
}
