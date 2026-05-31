// ── F102 · src/app/(app)/layout.tsx
// Purpose: App shell Server Component — session gate + redirect to /login + AppShell render
// In: veda_session (F011) | Out: AppLayout wrapping AppShell | See: F011, F120
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (!session.userId) redirect('/login')

  return (
    <AppShell userName={session.name ?? 'Staff'} userRole={session.role ?? 'RECEPTIONIST'}>
      {children}
    </AppShell>
  )
}
