'use client'
// ── F182 · src/app/(app)/lab/page.tsx
// Purpose: Global lab cases dashboard — list, status filter, overdue + due-this-week highlights
// In: GET /api/lab (F070) | Out: LabPage | See: F070, F071, F025

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, FlaskConical, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LabCaseStatus } from '@/types'
import { LAB_CASE_STATUSES } from '@/constants/enums'

interface LabRow {
  id: string
  patient_id: string
  patient_name: string
  patient_phone: string
  case_type: string
  tooth_numbers: string | null
  status: string
  sent_at: string | null
  expected_at: string | null
  delivered_at: string | null
  lab_name: string | null
  created_at: string
}

const STATUS_CLS: Record<string, string> = {
  'Planned':          'bg-secondary text-secondary-foreground',
  'Impression Taken': 'bg-info/15 text-info',
  'Sent to Lab':      'bg-warning/15 text-warning',
  'Received':         'bg-success/15 text-success',
  'Fitted/Delivered': 'bg-success/30 text-success',
}

function isOverdue(row: LabRow): boolean {
  if (!row.expected_at) return false
  if (row.status === 'Received' || row.status === 'Fitted/Delivered') return false
  return new Date(row.expected_at) < new Date()
}

function isDueThisWeek(row: LabRow): boolean {
  if (!row.expected_at) return false
  if (row.status === 'Received' || row.status === 'Fitted/Delivered') return false
  const due = new Date(row.expected_at)
  const now = new Date()
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return due >= now && due <= week
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  })
}

export default function LabPage() {
  const [cases, setCases]       = useState<LabRow[]>([])
  const [filter, setFilter]     = useState<LabCaseStatus | 'All'>('All')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    const qs = filter !== 'All' ? `?status=${encodeURIComponent(filter)}` : ''
    fetch(`/api/lab${qs}`)
      .then((r) => r.json())
      .then((data) => { setCases(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  const overdue     = cases.filter(isOverdue)
  const dueThisWeek = cases.filter((c) => !isOverdue(c) && isDueThisWeek(c))
  const active      = cases.filter(
    (c) => c.status !== 'Received' && c.status !== 'Fitted/Delivered',
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {cases.length} case{cases.length !== 1 ? 's' : ''}
            {active.length > 0 && ` · ${active.length} active`}
            {overdue.length > 0 && (
              <span className="ml-1 font-semibold text-danger">
                · {overdue.length} overdue
              </span>
            )}
          </p>
        </div>
        <Link
          href="/lab/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          New Lab Case
        </Link>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <div className="text-sm text-danger">
            <span className="font-semibold">{overdue.length} case{overdue.length !== 1 ? 's' : ''} overdue:</span>{' '}
            {overdue.map((c) => `${c.patient_name} (${c.case_type})`).join(', ')}
          </div>
        </div>
      )}

      {/* Due this week alert */}
      {dueThisWeek.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm text-warning">
            <span className="font-semibold">{dueThisWeek.length} case{dueThisWeek.length !== 1 ? 's' : ''} due this week</span>
          </p>
        </div>
      )}

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['All', ...LAB_CASE_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s as LabCaseStatus | 'All')}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === s
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : cases.length === 0 ? (
        <div className="rounded-lg border border-border bg-background p-8 text-center">
          <FlaskConical className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No lab cases found.</p>
          <Link href="/lab/new" className="mt-2 inline-block text-xs text-primary hover:underline">
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Patient</th>
                <th className="px-4 py-2.5 text-left font-medium">Case Type</th>
                <th className="px-4 py-2.5 text-left font-medium">Teeth</th>
                <th className="px-4 py-2.5 text-left font-medium">Lab</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-left font-medium">Sent</th>
                <th className="px-4 py-2.5 text-left font-medium">Expected back</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cases.map((c) => {
                const overdueMark = isOverdue(c)
                const weekMark    = !overdueMark && isDueThisWeek(c)
                return (
                  <tr
                    key={c.id}
                    className={cn(
                      'hover:bg-surface/50',
                      overdueMark && 'bg-danger-bg/40',
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/patients/${c.patient_id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {c.patient_name}
                      </Link>
                      <p className="text-[10px] text-muted-foreground">{c.patient_phone}</p>
                    </td>
                    <td className="px-4 py-2.5 text-foreground">{c.case_type}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {c.tooth_numbers ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.lab_name ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'inline-block rounded px-2 py-0.5 text-[10px] font-semibold',
                          STATUS_CLS[c.status] ?? 'bg-secondary text-secondary-foreground',
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {fmtDate(c.sent_at)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'text-xs',
                          overdueMark && 'font-semibold text-danger',
                          weekMark    && 'font-semibold text-warning',
                          !overdueMark && !weekMark && 'text-muted-foreground',
                        )}
                      >
                        {fmtDate(c.expected_at)}
                        {overdueMark && ' ⚠ Overdue'}
                        {weekMark    && ' · Due soon'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Row-click to detail — implemented as a separate overlay link per row */}
          <div className="border-t border-border px-4 py-2 text-right text-[11px] text-muted-foreground">
            Click a patient name to open their profile, or{' '}
            <Link href="/lab/new" className="text-primary hover:underline">
              create a new case
            </Link>
            .
          </div>
        </div>
      )}
    </div>
  )
}
