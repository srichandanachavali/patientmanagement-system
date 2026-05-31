// ── F130 · src/app/(app)/dashboard/page.tsx
// Purpose: Dashboard Server Component — 9 parallel Prisma queries, IST date math, recalls panel, wa.me links
// In: Prisma (F010), formatCurrency/formatDate/formatTime (F012), dashboard widgets (F131–F133) | Out: DashboardPage | See: F010, F012, F131, F132, F133
import Link from 'next/link'
import { CalendarPlus, UserPlus, ReceiptText, MessageCircle, Clock } from 'lucide-react'
import { prisma } from '@/lib/db'
import { cn, formatCurrency, formatTime, formatDate } from '@/lib/utils'
import { RevenueWidget } from '@/components/dashboard/RevenueWidget'
import { AppointmentsWidget } from '@/components/dashboard/AppointmentsWidget'
import { ReceivablesWidget } from '@/components/dashboard/ReceivablesWidget'

// ── IST helpers ─────────────────────────────────────────────────────────────
const IST_MS = 5.5 * 60 * 60 * 1000

function istBounds() {
  const now = new Date()
  const nowIst = new Date(now.getTime() + IST_MS)
  const todayStart = new Date(
    Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate()) - IST_MS,
  )
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
  const monthStart = new Date(
    Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), 1) - IST_MS,
  )
  return { now, todayStart, todayEnd, monthStart }
}

// ── Reminder templates ───────────────────────────────────────────────────────
function recallWaLink(name: string, phone: string, lang: string): string {
  const clean = phone.replace(/\D/g, '')
  const text = lang === 'te'
    ? `నమస్కారం ${name} గారు, మీరు చాలా కాలం VEDA Dental Clinic కి రాలేదు. దయచేసి ఒక routine check-up కి అపాయింట్‌మెంట్ పెట్టుకోండి. Call: 07660966674. ధన్యవాదాలు.`
    : `Hello ${name}, it has been a while since your last visit at VEDA Super Speciality Dental Clinic, Vijayawada. We recommend a routine check-up. Please call 07660966674 to book. Thank you!`
  return `https://wa.me/91${clean}?text=${encodeURIComponent(text)}`
}

// ── Status display ────────────────────────────────────────────────────────────
const STATUS_CLS: Record<string, string> = {
  BOOKED:    'bg-secondary text-secondary-foreground',
  CONFIRMED: 'bg-info/10 text-info',
  ARRIVED:   'bg-warning/10 text-warning',
  IN_CHAIR:  'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-success/10 text-success',
  NO_SHOW:   'bg-danger-bg text-danger',
  CANCELLED: 'bg-danger-bg/60 text-danger/70',
}
const STATUS_LABEL: Record<string, string> = {
  BOOKED: 'Booked', CONFIRMED: 'Confirmed', ARRIVED: 'Arrived',
  IN_CHAIR: 'In Chair', COMPLETED: 'Completed', NO_SHOW: 'No Show', CANCELLED: 'Cancelled',
}

function getDayGreeting() {
  const h = new Date().getUTCHours() + 5.5 / 1 | 0  // rough IST hour
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default async function DashboardPage() {
  const { now, todayStart, todayEnd, monthStart } = istBounds()
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)

  // ── Parallel queries ───────────────────────────────────────────────────────
  const [
    todayAppointments,
    todayPayments,
    monthPayments,
    openInvoices,
    monthInvoiceCount,
    monthEndedAppts,
    lastCompletedAppts,
    futureAppts,
    settings,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { start: { gte: todayStart, lt: todayEnd } },
      include: {
        patient: { select: { name: true } },
        dentist: { select: { name: true } },
      },
      orderBy: { start: 'asc' },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: todayStart, lt: todayEnd } },
      select: { amount: true },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: monthStart } },
      select: { amount: true },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ['SENT', 'PARTIALLY_PAID', 'DRAFT'] } },
      include: {
        lines: { select: { amount: true, taxRate: true } },
        payments: { select: { amount: true } },
      },
    }),
    prisma.invoice.count({ where: { createdAt: { gte: monthStart } } }),
    // Appointments that ended this month (for no-show %)
    prisma.appointment.findMany({
      where: { start: { gte: monthStart, lt: now }, status: { in: ['COMPLETED', 'NO_SHOW', 'CANCELLED'] } },
      select: { status: true },
    }),
    // Last completed appointment per patient (for recalls)
    prisma.appointment.findMany({
      where: { status: 'COMPLETED' },
      select: {
        patientId: true, start: true,
        patient: { select: { name: true, phone: true, preferredLanguage: true } },
      },
      orderBy: { start: 'desc' },
    }),
    // Future non-cancelled appointments (exclude these patients from recalls)
    prisma.appointment.findMany({
      where: { start: { gt: now }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
      select: { patientId: true },
    }),
    prisma.clinicSettings.findUnique({ where: { id: 1 } }),
  ])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const todayRevenue  = todayPayments.reduce((s, p) => s + p.amount, 0)
  const monthRevenue  = monthPayments.reduce((s, p) => s + p.amount, 0)

  const outstanding   = openInvoices.reduce((s, inv) => {
    const total = inv.lines.reduce((ls, l) => ls + l.amount * (1 + l.taxRate / 100), 0)
    const paid  = inv.payments.reduce((ps, p) => ps + p.amount, 0)
    return s + Math.max(0, total - paid)
  }, 0)

  const noShowCount   = monthEndedAppts.filter(a => a.status === 'NO_SHOW').length
  const noShowPct     = monthEndedAppts.length > 0 ? Math.round((noShowCount / monthEndedAppts.length) * 100) : 0

  const todayCompleted = todayAppointments.filter(a => a.status === 'COMPLETED').length
  const todayRemaining = todayAppointments.filter(a => !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status)).length

  // ── Recalls ────────────────────────────────────────────────────────────────
  const futurePatientIds = new Set(futureAppts.map(a => a.patientId))
  const lastByPatient = new Map<string, { name: string; phone: string; lang: string; lastVisit: Date }>()
  for (const a of lastCompletedAppts) {
    if (!lastByPatient.has(a.patientId)) {
      lastByPatient.set(a.patientId, {
        name: a.patient.name,
        phone: a.patient.phone,
        lang: a.patient.preferredLanguage,
        lastVisit: a.start,
      })
    }
  }
  const recalls = [...lastByPatient.entries()]
    .filter(([pid, d]) => d.lastVisit < sixMonthsAgo && !futurePatientIds.has(pid))
    .slice(0, 6)
    .map(([, d]) => d)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{getDayGreeting()}</h2>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Stat widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RevenueWidget
          todayRevenue={todayRevenue}
          monthRevenue={monthRevenue}
          monthInvoiceCount={monthInvoiceCount}
        />
        <AppointmentsWidget
          total={todayAppointments.length}
          completed={todayCompleted}
          remaining={todayRemaining}
          chairs={settings?.chairCount ?? 3}
        />
        <ReceivablesWidget
          outstanding={outstanding}
          unpaidCount={openInvoices.length}
          noShowPct={noShowPct}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">

        {/* Today's schedule */}
        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold text-foreground">Today's Schedule</h3>
            <Link href="/appointments" className="text-xs text-primary hover:underline">View calendar →</Link>
          </div>

          {todayAppointments.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No appointments today.</p>
          ) : (
            <div className="divide-y divide-border">
              {todayAppointments.map((appt) => (
                <Link
                  key={appt.id}
                  href={`/appointments/${appt.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-surface"
                >
                  <div className="flex w-14 shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(appt.start.toISOString())}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{appt.patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {appt.dentist.name} · Chair {appt.chair}
                    </p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium', STATUS_CLS[appt.status])}>
                    {STATUS_LABEL[appt.status] ?? appt.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Recalls */}
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Recalls Due</h3>
              <p className="text-[11px] text-muted-foreground">Last visit &gt; 6 months ago</p>
            </div>
            {recalls.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">No recalls due.</p>
            ) : (
              <div className="divide-y divide-border">
                {recalls.map((r) => (
                  <div key={r.phone} className="flex items-center justify-between gap-2 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(r.lastVisit.toISOString())}</p>
                    </div>
                    <a
                      href={recallWaLink(r.name, r.phone, r.lang)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Send recall reminder via WhatsApp"
                      className="flex shrink-0 items-center gap-1 rounded-md bg-[#25D366] px-2 py-1 text-[10px] font-medium text-white hover:opacity-90"
                    >
                      <MessageCircle className="h-3 w-3" />
                      WA
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { href: '/patients/new',     label: 'New Patient',      Icon: UserPlus },
                { href: '/appointments/new', label: 'New Appointment',   Icon: CalendarPlus },
                { href: '/billing/new',      label: 'New Invoice',       Icon: ReceiptText },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-surface"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
