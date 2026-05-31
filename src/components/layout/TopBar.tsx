'use client'
// ── F122 · src/components/layout/TopBar.tsx
// Purpose: Page title map + user name/role chip + sign-out button → POST /api/auth/logout
// In: userName, userRole props | Out: TopBar | See: F120, F051

import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

const PAGE_TITLES: Record<string, string> = {
  dashboard:        'Dashboard',
  patients:         'Patients',
  appointments:     'Appointments',
  billing:          'Billing',
  lab:              'Lab Cases',
  recalls:          'Recalls',
  analytics:        'Analytics',
  settings:         'Settings',
  'audit-log':      'Audit Log',
  odontogram:       'Odontogram',
  'treatment-plans':'Treatment Plans',
  notes:            'Clinical Notes',
  attachments:      'Attachments',
  prescriptions:    'Prescriptions',
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN:         'Admin',
  DENTIST:       'Dentist',
  RECEPTIONIST:  'Receptionist',
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  for (const seg of segments) {
    if (PAGE_TITLES[seg]) return PAGE_TITLES[seg]
  }
  return 'VEDA Dental PMS'
}

interface TopBarProps {
  userName: string
  userRole: string
}

export function TopBar({ userName, userRole }: TopBarProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const title     = getPageTitle(pathname)
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    setBusy(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-medium text-foreground leading-none">{userName}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground leading-none">
            {ROLE_LABEL[userRole] ?? userRole}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          {busy ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </header>
  )
}
