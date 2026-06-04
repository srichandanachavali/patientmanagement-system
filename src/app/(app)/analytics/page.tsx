'use client'
// ── F184 · src/app/(app)/analytics/page.tsx
// Purpose: Clinic-owner analytics dashboard — revenue, appointments, patients (full), receivables
// In: GET /api/analytics (F196) | Out: AnalyticsPage | See: F196, F012

import { useState, useEffect } from 'react'
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts'
import {
  TrendingUp, Users, Calendar, FlaskConical, AlertTriangle,
  Clock, IndianRupee, UserCheck, UserX, Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsPayload {
  range: string
  revenue: {
    today: number
    this_week: number
    this_month: number
    outstanding: number
    monthly_trend: { month: string; collected: number }[]
  }
  appointments: {
    by_status: Record<string, number>
    by_day: { day: string; count: number }[]
    by_hour: { hour: string; count: number }[]
    no_show_by_month: { month: string; pct: number }[]
  }
  treatment_plans: {
    total: number
    proposed: number
    accepted: number
    in_progress: number
    completed: number
    cancelled: number
    acceptance_rate: number
  }
  recalls: { due_this_week: number; due_this_month: number }
  lab_cases: { open: number; overdue: number }
  patients: {
    total_active: number
    new_in_range: number
    returning_in_range: number
    with_outstanding: number
    lapsed: number
    gender_split: { name: string; value: number }[]
    age_groups: { label: string; count: number }[]
    new_per_month: { month: string; count: number }[]
    top_by_visits: { id: string; name: string; visits: number }[]
    top_by_revenue: { id: string; name: string; revenue: number }[]
    top_procedures: { name: string; count: number; revenue: number }[]
  }
  receivables: {
    aged_0_30: number
    aged_31_60: number
    aged_61plus: number
    top_debtors: { name: string; balance: number }[]
  }
}

type Range = 'month' | '3month' | 'all'

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn('mt-1 text-xl font-bold tabular-nums', accent ?? 'text-foreground')}>{value}</p>
          {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
        </div>
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  )
}

function SectionHead({ title }: { title: string }) {
  return <h2 className="text-sm font-semibold text-foreground">{title}</h2>
}

function EmptyChart({ msg }: { msg: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-surface/30">
      <p className="text-xs text-muted-foreground">{msg}</p>
    </div>
  )
}

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899']
const AXIS_STYLE = { fontSize: 10, fill: 'hsl(var(--muted-foreground))' }
const TIP_STYLE  = { fontSize: 11, borderRadius: 6 }

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange]     = useState<Range>('month')
  const [data, setData]       = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true); setError(null)
    fetch(`/api/analytics?range=${range}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then((d: AnalyticsPayload) => { setData(d); setLoading(false) })
      .catch(() => { setError('Could not load analytics.'); setLoading(false) })
  }, [range])

  const rangeLabel = range === 'month' ? 'This month' : range === '3month' ? 'Last 3 months' : 'All time'

  return (
    <div className="space-y-7 pb-16">
      {/* Header + range filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground">Clinic performance overview · {rangeLabel}</p>
        </div>
        <div className="flex gap-1.5">
          {(['month', '3month', 'all'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                range === r
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50',
              )}
            >
              {r === 'month' ? 'This month' : r === '3month' ? 'Last 3 months' : 'All time'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{error}</div>
      )}

      {!loading && !error && data && (
        <>
          {/* ── 1. Revenue ── */}
          <section className="space-y-3">
            <SectionHead title="Revenue" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Today" value={fmt(data.revenue.today)} icon={IndianRupee} />
              <StatCard label="This week" value={fmt(data.revenue.this_week)} icon={IndianRupee} />
              <StatCard label="This month" value={fmt(data.revenue.this_month)} icon={IndianRupee} />
              <StatCard
                label="Outstanding"
                value={fmt(data.revenue.outstanding)}
                icon={AlertTriangle}
                accent={data.revenue.outstanding > 0 ? 'text-warning' : undefined}
              />
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Collected — last 6 months</p>
              {data.revenue.monthly_trend.every(m => m.collected === 0) ? (
                <EmptyChart msg="No payments in the last 6 months" />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data.revenue.monthly_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={AXIS_STYLE} />
                    <YAxis tick={AXIS_STYLE} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                    <Tooltip contentStyle={TIP_STYLE} formatter={(v) => [fmt(Number(v)), 'Collected']} />
                    <Line type="monotone" dataKey="collected" stroke="#6366f1" strokeWidth={2}
                      dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* ── 2. Appointments ── */}
          <section className="space-y-3">
            <SectionHead title="Appointments" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">By status</p>
                {Object.keys(data.appointments.by_status).length === 0 ? (
                  <EmptyChart msg="No appointments in this period" />
                ) : (() => {
                  const pieData = Object.entries(data.appointments.by_status).map(([name, value]) => ({ name, value }))
                  return (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={TIP_STYLE} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )
                })()}
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">Busiest days</p>
                {data.appointments.by_day.every(d => d.count === 0) ? (
                  <EmptyChart msg="No appointments in this period" />
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.appointments.by_day}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={AXIS_STYLE} />
                      <YAxis tick={AXIS_STYLE} allowDecimals={false} />
                      <Tooltip contentStyle={TIP_STYLE} />
                      <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} name="Appointments" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Busiest hours (9 AM – 9 PM)</p>
              {data.appointments.by_hour.every(h => h.count === 0) ? (
                <EmptyChart msg="No appointments in this period" />
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={data.appointments.by_hour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={AXIS_STYLE} />
                    <YAxis tick={AXIS_STYLE} allowDecimals={false} />
                    <Tooltip contentStyle={TIP_STYLE} />
                    <Bar dataKey="count" fill="#10b981" radius={[3, 3, 0, 0]} name="Appointments" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">No-show rate — last 6 months</p>
              {data.appointments.no_show_by_month.every(m => m.pct === 0) ? (
                <EmptyChart msg="No no-shows recorded" />
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={data.appointments.no_show_by_month}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={AXIS_STYLE} />
                    <YAxis tick={AXIS_STYLE} tickFormatter={v => v + '%'} domain={[0, 100]} />
                    <Tooltip contentStyle={TIP_STYLE} formatter={(v) => [Number(v) + '%', 'No-show rate']} />
                    <Line type="monotone" dataKey="pct" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* ── 3. Treatment Plans + Recalls + Lab ── */}
          <section className="space-y-3">
            <SectionHead title="Treatment Plans, Recalls & Lab" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Plan acceptance"
                value={data.treatment_plans.acceptance_rate + '%'}
                sub={`${data.treatment_plans.total} plans total`}
                icon={TrendingUp}
                accent={data.treatment_plans.acceptance_rate >= 60 ? 'text-success' : 'text-warning'}
              />
              <StatCard
                label="Recalls this month"
                value={String(data.recalls.due_this_month)}
                sub="overdue 6+ months"
                icon={Clock}
                accent={data.recalls.due_this_month > 0 ? 'text-warning' : undefined}
              />
              <StatCard label="Lab cases open" value={String(data.lab_cases.open)} icon={FlaskConical} />
              <StatCard
                label="Lab overdue"
                value={String(data.lab_cases.overdue)}
                icon={AlertTriangle}
                accent={data.lab_cases.overdue > 0 ? 'text-danger' : undefined}
              />
            </div>
            {data.treatment_plans.total > 0 && (() => {
              const planPie = [
                { name: 'Proposed',    value: data.treatment_plans.proposed },
                { name: 'Accepted',    value: data.treatment_plans.accepted },
                { name: 'In Progress', value: data.treatment_plans.in_progress },
                { name: 'Completed',   value: data.treatment_plans.completed },
                { name: 'Cancelled',   value: data.treatment_plans.cancelled },
              ].filter(p => p.value > 0)
              return (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">Treatment plan status breakdown</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={planPie} cx="50%" cy="50%" outerRadius={60} paddingAngle={2} dataKey="value">
                        {planPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={TIP_STYLE} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )
            })()}
          </section>

          {/* ── 4. Patients ── */}
          <section className="space-y-3">
            <SectionHead title="Patients" />

            {/* Summary stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <StatCard label="Total active" value={String(data.patients.total_active)} icon={Users} />
              <StatCard
                label="New in period"
                value={String(data.patients.new_in_range)}
                sub={rangeLabel}
                icon={UserCheck}
                accent="text-success"
              />
              <StatCard
                label="Returning"
                value={String(data.patients.returning_in_range)}
                sub="completed appt."
                icon={Calendar}
              />
              <StatCard
                label="Outstanding balance"
                value={String(data.patients.with_outstanding)}
                sub="patients with dues"
                icon={IndianRupee}
                accent={data.patients.with_outstanding > 0 ? 'text-warning' : undefined}
              />
              <StatCard
                label="Lapsed (12+ mo)"
                value={String(data.patients.lapsed)}
                sub="no visit in 12 months"
                icon={UserX}
                accent={data.patients.lapsed > 0 ? 'text-danger' : undefined}
              />
            </div>

            {/* New patients per month trend */}
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">New patient registrations — last 6 months</p>
              {data.patients.new_per_month.every(m => m.count === 0) ? (
                <EmptyChart msg="No new patients in the last 6 months" />
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data.patients.new_per_month}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={AXIS_STYLE} />
                    <YAxis tick={AXIS_STYLE} allowDecimals={false} />
                    <Tooltip contentStyle={TIP_STYLE} />
                    <Bar dataKey="count" fill="#10b981" radius={[3, 3, 0, 0]} name="New patients" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Age + gender split */}
            {(data.patients.age_groups.length > 0 || data.patients.gender_split.length > 0) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.patients.age_groups.length > 0 && (
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="mb-3 text-xs font-medium text-muted-foreground">Age distribution</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={data.patients.age_groups}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="label" tick={AXIS_STYLE} />
                        <YAxis tick={AXIS_STYLE} allowDecimals={false} />
                        <Tooltip contentStyle={TIP_STYLE} />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Patients" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {data.patients.gender_split.length > 0 && (
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="mb-3 text-xs font-medium text-muted-foreground">Gender split</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={data.patients.gender_split} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                          {data.patients.gender_split.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={TIP_STYLE} />
                        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Top patients by visits + by revenue side by side */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.patients.top_by_visits.length > 0 && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Activity className="h-3.5 w-3.5" />
                    Top patients by visits
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-1.5 font-medium">#</th>
                        <th className="pb-1.5 font-medium">Patient</th>
                        <th className="pb-1.5 text-right font-medium">Visits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.patients.top_by_visits.map((p, i) => (
                        <tr key={p.id}>
                          <td className="py-1.5 pr-2 text-muted-foreground tabular-nums">{i + 1}</td>
                          <td className="py-1.5 text-foreground">{p.name}</td>
                          <td className="py-1.5 text-right tabular-nums font-semibold text-primary">{p.visits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {data.patients.top_by_revenue.length > 0 && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Top patients by revenue
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-1.5 font-medium">#</th>
                        <th className="pb-1.5 font-medium">Patient</th>
                        <th className="pb-1.5 text-right font-medium">Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.patients.top_by_revenue.map((p, i) => (
                        <tr key={p.id}>
                          <td className="py-1.5 pr-2 text-muted-foreground tabular-nums">{i + 1}</td>
                          <td className="py-1.5 text-foreground">{p.name}</td>
                          <td className="py-1.5 text-right tabular-nums font-semibold text-success">{fmt(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top procedures */}
            {data.patients.top_procedures.length > 0 && (
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">Top procedures by revenue</p>
                <ResponsiveContainer width="100%" height={Math.max(160, data.patients.top_procedures.length * 28)}>
                  <BarChart layout="vertical" data={data.patients.top_procedures} margin={{ left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tick={AXIS_STYLE} tickFormatter={v => '₹' + (v / 1000).toFixed(0) + 'k'} />
                    <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={130} />
                    <Tooltip contentStyle={TIP_STYLE} formatter={(v) => [fmt(Number(v)), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 3, 3, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
                <table className="mt-4 w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-1.5 font-medium">Procedure</th>
                      <th className="pb-1.5 text-right font-medium">Count</th>
                      <th className="pb-1.5 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.patients.top_procedures.map((p, i) => (
                      <tr key={i}>
                        <td className="py-1.5 pr-4 text-foreground">{p.name}</td>
                        <td className="py-1.5 text-right tabular-nums text-muted-foreground">{p.count}</td>
                        <td className="py-1.5 text-right tabular-nums font-medium text-foreground">{fmt(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── 5. Receivables ── */}
          <section className="space-y-3">
            <SectionHead title="Receivables" />
            {(data.receivables.aged_0_30 + data.receivables.aged_31_60 + data.receivables.aged_61plus === 0) ? (
              <div className="rounded-lg border border-border bg-background p-4 text-center text-xs text-muted-foreground">
                No outstanding balances.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-background p-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">0–30 days</p>
                    <p className="mt-1 text-lg font-bold text-foreground tabular-nums">{fmt(data.receivables.aged_0_30)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">31–60 days</p>
                    <p className="mt-1 text-lg font-bold text-warning tabular-nums">{fmt(data.receivables.aged_31_60)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">61+ days</p>
                    <p className="mt-1 text-lg font-bold text-danger tabular-nums">{fmt(data.receivables.aged_61plus)}</p>
                  </div>
                </div>
                {data.receivables.top_debtors.length > 0 && (
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="mb-3 text-xs font-medium text-muted-foreground">Top outstanding balances</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="pb-1.5 font-medium">Patient</th>
                          <th className="pb-1.5 text-right font-medium">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.receivables.top_debtors.map((d, i) => (
                          <tr key={i}>
                            <td className="py-1.5 text-foreground">{d.name}</td>
                            <td className="py-1.5 text-right tabular-nums font-semibold text-danger">{fmt(d.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}
