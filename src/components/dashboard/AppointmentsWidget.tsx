// ── F132 · src/components/dashboard/AppointmentsWidget.tsx
// Purpose: Appointment stat card — today's count + completed progress bar
// In: total, completed, remaining, chairs numbers | Out: AppointmentsWidget | See: F130
import { CalendarDays } from 'lucide-react'

interface AppointmentsWidgetProps {
  total: number
  completed: number
  remaining: number
  chairs: number
}

export function AppointmentsWidget({ total, completed, remaining, chairs }: AppointmentsWidgetProps) {
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Today's Appointments</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{total}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {remaining} remaining · {chairs} chairs
          </p>
        </div>
        <div className="rounded-md bg-info/10 p-2">
          <CalendarDays className="h-5 w-5 text-info" />
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{completed} completed</span>
          <span>{completedPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-info transition-all" style={{ width: `${completedPct}%` }} />
        </div>
      </div>
    </div>
  )
}
