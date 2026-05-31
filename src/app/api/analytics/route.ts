// ── F196 · src/app/api/analytics/route.ts
// Purpose: Analytics data — revenue trend, appointments, treatment plans, recalls, lab, patients, receivables
// In: veda_session (F011), ?range=month|3month|all | Out: AnalyticsPayload | See: F010, F011, F184

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/session'

const IST_MS = 5.5 * 60 * 60 * 1000

function istNow() {
  const now = new Date()
  const ist = new Date(now.getTime() + IST_MS)
  return {
    now,
    todayStart: new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - IST_MS),
    weekStart:  new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - ist.getUTCDay()) - IST_MS),
    monthStart: new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1) - IST_MS),
    year:       ist.getUTCFullYear(),
    month:      ist.getUTCMonth(),
  }
}

function monthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month, 1))
    .toLocaleDateString('en-IN', { month: 'short', year: '2-digit', timeZone: 'UTC' })
}

export async function GET(request: Request) {
  try { await requireSession() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') ?? 'month'  // 'month' | '3month' | 'all'

  const { now, todayStart, weekStart, monthStart, year, month } = istNow()
  const todayEnd = new Date(todayStart.getTime() + 86_400_000)

  // Window for "range" filter
  let rangeStart: Date | undefined
  if (range === 'month')  rangeStart = monthStart
  if (range === '3month') rangeStart = new Date(Date.UTC(year, month - 3, 1) - IST_MS)
  // 'all' → rangeStart = undefined (no lower bound)

  const apptWhere = rangeStart ? { start: { gte: rangeStart, lte: now } } : {}
  const payWhere  = rangeStart ? { paidAt: { gte: rangeStart, lte: now } } : {}

  // ── 1. Revenue ──────────────────────────────────────────────────────────────
  const [todayPayments, weekPayments, monthPayments, allPayments, openInvoices] = await Promise.all([
    prisma.payment.findMany({ where: { paidAt: { gte: todayStart, lt: todayEnd } }, select: { amount: true } }),
    prisma.payment.findMany({ where: { paidAt: { gte: weekStart, lt: now } }, select: { amount: true } }),
    prisma.payment.findMany({ where: { paidAt: { gte: monthStart, lte: now } }, select: { amount: true } }),
    prisma.payment.findMany({ where: payWhere, select: { amount: true, paidAt: true } }),
    prisma.invoice.findMany({
      where: { status: { in: ['SENT', 'PARTIALLY_PAID', 'DRAFT'] } },
      select: {
        id: true, status: true, issuedAt: true,
        patient:  { select: { id: true, name: true } },
        lines:    { select: { amount: true, taxRate: true } },
        payments: { select: { amount: true } },
      },
    }),
  ])

  const sum = (ps: { amount: number }[]) => ps.reduce((s, p) => s + p.amount, 0)
  const todayRevenue = sum(todayPayments)
  const weekRevenue  = sum(weekPayments)
  const monthRevenue = sum(monthPayments)

  // Outstanding
  const outstanding = openInvoices.reduce((s, inv) => {
    const total = inv.lines.reduce((ls, l) => ls + l.amount * (1 + l.taxRate / 100), 0)
    const paid  = inv.payments.reduce((ps, p) => ps + p.amount, 0)
    return s + Math.max(0, total - paid)
  }, 0)

  // 6-month trend (always last 6 months regardless of range)
  const sixMonthsAgoDate = new Date(Date.UTC(year, month - 5, 1) - IST_MS)
  const trendPayments = await prisma.payment.findMany({
    where: { paidAt: { gte: sixMonthsAgoDate } },
    select: { amount: true, paidAt: true },
  })
  const trendMap: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    trendMap[monthLabel(year, month - i)] = 0
  }
  for (const p of trendPayments) {
    const ist = new Date(p.paidAt.getTime() + IST_MS)
    const key = monthLabel(ist.getUTCFullYear(), ist.getUTCMonth())
    if (key in trendMap) trendMap[key] = (trendMap[key] ?? 0) + p.amount
  }
  const monthlyTrend = Object.entries(trendMap).map(([month, collected]) => ({ month, collected }))

  // ── 2. Appointments ────────────────────────────────────────────────────────
  const appts = await prisma.appointment.findMany({
    where: apptWhere,
    select: { status: true, start: true },
  })

  const byStatus: Record<string, number> = {}
  for (const a of appts) {
    byStatus[a.status] = (byStatus[a.status] ?? 0) + 1
  }

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const byDay: Record<string, number> = {}
  const byHour: Record<number, number> = {}
  for (const a of appts) {
    const ist = new Date(a.start.getTime() + IST_MS)
    const day = DAY_NAMES[ist.getUTCDay()]
    byDay[day]  = (byDay[day] ?? 0) + 1
    const h = ist.getUTCHours()
    byHour[h]   = (byHour[h] ?? 0) + 1
  }

  const byDayArr = DAY_NAMES.map(d => ({ day: d, count: byDay[d] ?? 0 }))
  const byHourArr = Array.from({ length: 13 }, (_, i) => i + 9).map(h => ({
    hour: h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`,
    count: byHour[h] ?? 0,
  }))

  // No-show % by month (last 6 months)
  const endedApptsByMonth = await prisma.appointment.findMany({
    where: { start: { gte: sixMonthsAgoDate }, status: { in: ['COMPLETED', 'NO_SHOW', 'CANCELLED'] } },
    select: { status: true, start: true },
  })
  const noShowMap: Record<string, { total: number; noShow: number }> = {}
  for (let i = 5; i >= 0; i--) {
    noShowMap[monthLabel(year, month - i)] = { total: 0, noShow: 0 }
  }
  for (const a of endedApptsByMonth) {
    const ist = new Date(a.start.getTime() + IST_MS)
    const key = monthLabel(ist.getUTCFullYear(), ist.getUTCMonth())
    if (key in noShowMap) {
      noShowMap[key].total++
      if (a.status === 'NO_SHOW') noShowMap[key].noShow++
    }
  }
  const noShowByMonth = Object.entries(noShowMap).map(([month, d]) => ({
    month,
    pct: d.total > 0 ? Math.round((d.noShow / d.total) * 100) : 0,
  }))

  // ── 3. Treatment plans ──────────────────────────────────────────────────────
  const plans = await prisma.treatmentPlan.findMany({
    where: rangeStart ? { createdAt: { gte: rangeStart } } : {},
    select: { status: true },
  })
  const planCounts = { total: plans.length, proposed: 0, accepted: 0, in_progress: 0, completed: 0, cancelled: 0 }
  for (const p of plans) {
    const s = p.status.toLowerCase().replace(/[^a-z]/g, '_') as keyof typeof planCounts
    if (s in planCounts) (planCounts as Record<string, number>)[s]++
  }
  const acceptedCount = planCounts.accepted + planCounts.in_progress + planCounts.completed
  const acceptanceRate = plans.length > 0 ? Math.round((acceptedCount / plans.length) * 100) : 0

  // ── 4. Recalls ──────────────────────────────────────────────────────────────
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 86_400_000)
  const oneMonthLater = new Date(now.getTime() + 30 * 86_400_000)

  const [lastCompletedAppts, futureAppts] = await Promise.all([
    prisma.appointment.findMany({
      where: { status: 'COMPLETED' },
      select: { patientId: true, start: true },
      orderBy: { start: 'desc' },
    }),
    prisma.appointment.findMany({
      where: { start: { gt: now }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
      select: { patientId: true },
    }),
  ])
  const futureIds = new Set(futureAppts.map(a => a.patientId))
  const lastVisit = new Map<string, Date>()
  for (const a of lastCompletedAppts) {
    if (!lastVisit.has(a.patientId)) lastVisit.set(a.patientId, a.start)
  }
  let recallsDueThisWeek = 0, recallsDueThisMonth = 0
  for (const [pid, last] of lastVisit) {
    if (last < sixMonthsAgo && !futureIds.has(pid)) {
      recallsDueThisWeek++
      recallsDueThisMonth++
    }
  }

  // ── 5. Lab cases ────────────────────────────────────────────────────────────
  const labCases = await prisma.labCase.findMany({
    where: rangeStart ? { createdAt: { gte: rangeStart } } : {},
    select: { status: true, expectedAt: true },
  })
  const labOpen = labCases.filter(l => l.status !== 'Received' && l.status !== 'Fitted/Delivered').length
  const labOverdue = labCases.filter(l =>
    l.expectedAt && new Date(l.expectedAt) < now &&
    l.status !== 'Received' && l.status !== 'Fitted/Delivered',
  ).length

  // ── 6. Patients ──────────────────────────────────────────────────────────────
  const [allPatients, newPatients, returningAppts] = await Promise.all([
    prisma.patient.count({ where: { name: { not: '[Erased]' } } }),
    prisma.patient.count({
      where: rangeStart
        ? { createdAt: { gte: rangeStart }, name: { not: '[Erased]' } }
        : { name: { not: '[Erased]' } },
    }),
    rangeStart ? prisma.appointment.findMany({
      where: { start: { gte: rangeStart }, status: 'COMPLETED' },
      select: { patientId: true },
      distinct: ['patientId'],
    }) : Promise.resolve([]),
  ])
  const newPatientIds = rangeStart
    ? new Set((await prisma.patient.findMany({
        where: { createdAt: { gte: rangeStart }, name: { not: '[Erased]' } },
        select: { id: true },
      })).map(p => p.id))
    : new Set<string>()
  const returningCount = returningAppts.filter(a => !newPatientIds.has(a.patientId)).length

  // Top procedures by count + revenue (from invoice lines)
  const invoiceLines = await prisma.invoiceLine.findMany({
    where: rangeStart ? { invoice: { createdAt: { gte: rangeStart } } } : {},
    select: { description: true, amount: true, taxRate: true },
  })
  const procMap: Record<string, { count: number; revenue: number }> = {}
  for (const l of invoiceLines) {
    const key = l.description.substring(0, 40)
    if (!procMap[key]) procMap[key] = { count: 0, revenue: 0 }
    procMap[key].count++
    procMap[key].revenue += l.amount * (1 + l.taxRate / 100)
  }
  const topProcedures = Object.entries(procMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8)
    .map(([name, d]) => ({ name, count: d.count, revenue: Math.round(d.revenue) }))

  // ── 7. Receivables (aged) ────────────────────────────────────────────────────
  const aged = { d0_30: 0, d31_60: 0, d61plus: 0 }
  const debtorMap: Record<string, { name: string; balance: number }> = {}

  for (const inv of openInvoices) {
    const total = inv.lines.reduce((s, l) => s + l.amount * (1 + l.taxRate / 100), 0)
    const paid  = inv.payments.reduce((s, p) => s + p.amount, 0)
    const balance = Math.max(0, total - paid)
    if (balance === 0) continue

    const ageMs = now.getTime() - inv.issuedAt.getTime()
    const ageDays = Math.floor(ageMs / 86_400_000)
    if (ageDays <= 30)       aged.d0_30   += balance
    else if (ageDays <= 60)  aged.d31_60  += balance
    else                     aged.d61plus += balance

    const pid = inv.patient.id
    if (!debtorMap[pid]) debtorMap[pid] = { name: inv.patient.name, balance: 0 }
    debtorMap[pid].balance += balance
  }
  const topDebtors = Object.values(debtorMap)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)
    .map(d => ({ name: d.name, balance: Math.round(d.balance) }))

  return NextResponse.json({
    range,
    revenue: {
      today:         Math.round(todayRevenue),
      this_week:     Math.round(weekRevenue),
      this_month:    Math.round(monthRevenue),
      outstanding:   Math.round(outstanding),
      monthly_trend: monthlyTrend,
    },
    appointments: {
      by_status:      byStatus,
      by_day:         byDayArr,
      by_hour:        byHourArr,
      no_show_by_month: noShowByMonth,
    },
    treatment_plans: {
      ...planCounts,
      acceptance_rate: acceptanceRate,
    },
    recalls: {
      due_this_week:  recallsDueThisWeek,
      due_this_month: recallsDueThisMonth,
    },
    lab_cases: {
      open:    labOpen,
      overdue: labOverdue,
    },
    patients: {
      total_active:    allPatients,
      new_in_range:    newPatients,
      returning_in_range: returningCount,
      top_procedures:  topProcedures,
    },
    receivables: {
      aged_0_30:  Math.round(aged.d0_30),
      aged_31_60: Math.round(aged.d31_60),
      aged_61plus: Math.round(aged.d61plus),
      top_debtors: topDebtors,
    },
  })
}
