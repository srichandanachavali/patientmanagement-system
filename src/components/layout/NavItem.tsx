'use client'
// ── F123 · src/components/layout/NavItem.tsx
// Purpose: Active-aware nav link with LucideIcon prop; highlights current route and sub-paths
// In: href, label, Icon props | Out: NavItem | See: F121, F012

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  href: string
  label: string
  Icon: LucideIcon
}

export function NavItem({ href, label, Icon }: NavItemProps) {
  const pathname = usePathname()
  // Match exact route or any sub-path (e.g. /patients matches /patients/[id])
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-100',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}
