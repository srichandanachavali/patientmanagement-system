// ── F120 · src/components/layout/AppShell.tsx
// Purpose: App chrome — Sidebar + TopBar wrapper; receives userName + userRole from server layout
// In: userName, userRole strings (from F102) | Out: AppShell | See: F102, F121, F122
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
  userName: string
  userRole: string
}

export function AppShell({ children, userName, userRole }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar userName={userName} userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-[1280px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
