// ── F133 · src/components/dashboard/ReceivablesWidget.tsx
// Purpose: Receivables stat card — outstanding balance + unpaid count + no-show percentage
// In: outstanding, unpaidCount, noShowPct numbers | Out: ReceivablesWidget | See: F130, F012
import { AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ReceivablesWidgetProps {
  outstanding: number
  unpaidCount: number
  noShowPct: number
}

export function ReceivablesWidget({ outstanding, unpaidCount, noShowPct }: ReceivablesWidgetProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Outstanding</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(outstanding)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{unpaidCount} unpaid invoice{unpaidCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="rounded-md bg-warning/10 p-2">
          <AlertCircle className="h-5 w-5 text-warning" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>No-show rate this month: <strong className={noShowPct > 15 ? 'text-danger' : 'text-foreground'}>{noShowPct}%</strong></span>
      </div>
    </div>
  )
}
