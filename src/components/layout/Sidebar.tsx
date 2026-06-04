'use client'
// ── F121 · src/components/layout/Sidebar.tsx
// Purpose: Navigation sidebar with grouped NAV_GROUPS; 'use client' required — Lucide icons are functions
// In: CLINIC_NAME (F030), NavItem (F123) | Out: Sidebar | See: F120, F123, F030

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Receipt,
  FlaskConical,
  RotateCcw,
  BarChart2,
  Settings2,
  ShieldCheck,
  CalendarCheck2,
  Star,
} from 'lucide-react'
import { NavItem } from './NavItem'
import { CLINIC_NAME } from '@/constants/clinic'

const NAV_GROUPS = [
  {
    group: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    ],
  },
  {
    group: 'Operations',
    items: [
      { href: '/patients', label: 'Patients', Icon: Users },
      { href: '/appointments', label: 'Appointments', Icon: CalendarDays },
      { href: '/billing', label: 'Billing', Icon: Receipt },
      { href: '/lab', label: 'Lab Cases', Icon: FlaskConical },
      { href: '/follow-ups', label: 'Follow-ups', Icon: CalendarCheck2 },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { href: '/recalls', label: 'Recalls', Icon: RotateCcw },
      { href: '/analytics', label: 'Analytics', Icon: BarChart2 },
      { href: '/feedback', label: 'Feedback', Icon: Star },
    ],
  },
  {
    group: 'Admin',
    items: [
      { href: '/settings', label: 'Settings', Icon: Settings2 },
      { href: '/audit-log', label: 'Audit Log', Icon: ShieldCheck },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold select-none">
          V
        </div>
        <span className="text-sm font-semibold text-foreground leading-none">
          VEDA Dental
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map(({ group, items }) => (
          <div key={group}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <p className="truncate text-[11px] text-muted-foreground">{CLINIC_NAME}</p>
      </div>
    </aside>
  )
}
