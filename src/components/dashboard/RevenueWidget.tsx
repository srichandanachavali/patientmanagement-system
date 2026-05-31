// ── F131 · src/components/dashboard/RevenueWidget.tsx
// Purpose: Revenue stat card — today's revenue + month total + invoice count
// In: todayRevenue, monthRevenue, monthInvoiceCount numbers | Out: RevenueWidget | See: F130, F012
import { IndianRupee, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RevenueWidgetProps {
  todayRevenue: number
  monthRevenue: number
  monthInvoiceCount: number
}

export function RevenueWidget({ todayRevenue, monthRevenue, monthInvoiceCount }: RevenueWidgetProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Revenue Today</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(todayRevenue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{monthInvoiceCount} invoices this month</p>
        </div>
        <div className="rounded-md bg-success/10 p-2">
          <IndianRupee className="h-5 w-5 text-success" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5 text-success" />
        <span>{formatCurrency(monthRevenue)} this month</span>
      </div>
    </div>
  )
}
