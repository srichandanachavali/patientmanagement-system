'use client'
// ── F207 · src/app/(app)/feedback/page.tsx
// Purpose: Patient feedback summary — avg rating, category breakdown, trend, recent comments, low-rating alerts
// In: GET /api/feedback?summary=1 (F205) | Out: FeedbackPage | See: F205, F206

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { Star, AlertTriangle, TrendingUp, MessageSquare, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

interface FeedbackSummary {
  total: number
  avgRating: number
  lowRatingCount: number
  avgByCategory: {
    treatment: number | null
    staff: number | null
    waitTime: number | null
    cleanliness: number | null
    value: number | null
  }
  ratingTrend: { month: string; avg: number | null; count: number }[]
  recent: FeedbackItem[]
  lowRatingAlerts: FeedbackItem[]
}

interface FeedbackItem {
  id: string
  patientId: string
  patientName: string
  rating: number
  comment: string | null
  submittedAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn('h-3.5 w-3.5', i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  )
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
      rating >= 4 ? 'bg-success/10 text-success' :
      rating === 3 ? 'bg-warning/10 text-warning' :
      'bg-danger-bg text-danger',
    )}>
      <Star className="h-3 w-3 fill-current" />
      {rating}/5
    </span>
  )
}

// ── Add Feedback Modal ─────────────────────────────────────────────────────────

function AddFeedbackModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [patientQuery, setPatientQuery]     = useState('')
  const [patients, setPatients]             = useState<{ id: string; name: string; phone: string }[]>([])
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
  const [rating, setRating]                 = useState(5)
  const [treatmentRating, setTreatmentRating] = useState<number | ''>('')
  const [staffRating, setStaffRating]       = useState<number | ''>('')
  const [waitTimeRating, setWaitTimeRating] = useState<number | ''>('')
  const [cleanlinessRating, setCleanlinessRating] = useState<number | ''>('')
  const [valueRating, setValueRating]       = useState<number | ''>('')
  const [comment, setComment]               = useState('')
  const [saving, setSaving]                 = useState(false)

  useEffect(() => {
    if (!patientQuery.trim()) { setPatients([]); return }
    const id = setTimeout(() => {
      fetch(`/api/patients?q=${encodeURIComponent(patientQuery)}`)
        .then(r => r.json())
        .then((d: { id: string; name: string; phone: string }[]) => setPatients(d.slice(0, 6)))
    }, 300)
    return () => clearTimeout(id)
  }, [patientQuery])

  const submit = async () => {
    if (!selectedPatient) return
    setSaving(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId:         selectedPatient.id,
        rating,
        treatmentRating:   treatmentRating !== '' ? Number(treatmentRating) : undefined,
        staffRating:       staffRating !== '' ? Number(staffRating) : undefined,
        waitTimeRating:    waitTimeRating !== '' ? Number(waitTimeRating) : undefined,
        cleanlinessRating: cleanlinessRating !== '' ? Number(cleanlinessRating) : undefined,
        valueRating:       valueRating !== '' ? Number(valueRating) : undefined,
        comment:           comment || undefined,
      }),
    })
    setSaving(false)
    onSaved()
  }

  const StarPicker = ({ value, onChange }: { value: number | ''; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="focus:outline-none"
        >
          <Star className={cn('h-5 w-5 transition-colors', Number(value) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30 hover:text-amber-300')} />
        </button>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl space-y-4 my-4">
        <h2 className="text-sm font-semibold text-foreground">Record Patient Feedback</h2>

        {/* Patient */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Patient</label>
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-md border border-success/40 bg-success/5 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">{selectedPatient.name}</span>
              <button type="button" onClick={() => setSelectedPatient(null)} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={patientQuery}
                onChange={e => setPatientQuery(e.target.value)}
                placeholder="Search patient name…"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
              {patients.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-border bg-background shadow-md">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSelectedPatient(p); setPatientQuery(''); setPatients([]) }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface"
                    >
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="text-muted-foreground">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Overall rating */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Overall rating *</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* Category ratings */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Treatment', value: treatmentRating, set: setTreatmentRating },
            { label: 'Staff', value: staffRating, set: setStaffRating },
            { label: 'Wait time', value: waitTimeRating, set: setWaitTimeRating },
            { label: 'Cleanliness', value: cleanlinessRating, set: setCleanlinessRating },
            { label: 'Value for money', value: valueRating, set: setValueRating },
          ].map(({ label, value, set }) => (
            <div key={label} className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
              <StarPicker value={value} onChange={set} />
            </div>
          ))}
        </div>

        {/* Comment */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            placeholder="Patient's feedback in their own words…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={submit}
            disabled={saving || !selectedPatient}
            className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save feedback'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const [data, setData]       = useState<FeedbackSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/feedback?summary=1')
      .then(r => r.json())
      .then((d: FeedbackSummary) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const AXIS_STYLE = { fontSize: 10, fill: 'hsl(var(--muted-foreground))' }
  const TIP_STYLE  = { fontSize: 11, borderRadius: 6 }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-foreground">Patient Feedback</h1>
          <p className="text-xs text-muted-foreground">Satisfaction ratings and comments</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Record feedback
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Loading…</div>
      ) : !data || data.total === 0 ? (
        <div className="rounded-lg border border-border bg-background py-16 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-medium text-foreground">No feedback yet</p>
          <p className="text-xs text-muted-foreground">Record your first patient feedback using the button above.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Avg Rating</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{data.avgRating.toFixed(1)}</p>
              <div className="mt-1 flex justify-center">
                <Stars rating={data.avgRating} />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Reviews</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{data.total}</p>
              <p className="text-[11px] text-muted-foreground mt-1">all time</p>
            </div>
            <div className={cn('rounded-lg border p-4 text-center', data.lowRatingCount > 0 ? 'border-danger/40 bg-danger-bg/20' : 'border-border bg-background')}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Low Ratings</p>
              <p className={cn('mt-1 text-2xl font-bold tabular-nums', data.lowRatingCount > 0 ? 'text-danger' : 'text-foreground')}>{data.lowRatingCount}</p>
              <p className="text-[11px] text-muted-foreground mt-1">rated 1–2 stars</p>
            </div>
          </div>

          {/* Rating trend */}
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Rating trend — last 6 months</p>
            </div>
            {data.ratingTrend.every(m => m.avg === null) ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No data in the last 6 months</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data.ratingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={AXIS_STYLE} />
                  <YAxis tick={AXIS_STYLE} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip
                    contentStyle={TIP_STYLE}
                    formatter={(v, _n, p) => [`${v} (${p.payload.count} reviews)`, 'Avg rating']}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    connectNulls
                    name="Avg rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category radar */}
          {Object.values(data.avgByCategory).some(v => v !== null) && (() => {
            const cats = [
              { subject: 'Treatment',   A: data.avgByCategory.treatment ?? 0 },
              { subject: 'Staff',       A: data.avgByCategory.staff ?? 0 },
              { subject: 'Wait Time',   A: data.avgByCategory.waitTime ?? 0 },
              { subject: 'Cleanliness', A: data.avgByCategory.cleanliness ?? 0 },
              { subject: 'Value',       A: data.avgByCategory.value ?? 0 },
            ].filter(c => c.A > 0)
            return (
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Category breakdown (avg/5)</p>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={200} height={180}>
                    <RadarChart data={cats}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9 }} tickCount={4} />
                      <Radar name="Rating" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {cats.map(c => (
                      <div key={c.subject} className="flex items-center gap-2">
                        <span className="w-20 shrink-0 text-xs text-muted-foreground">{c.subject}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-border/50 h-2">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${(c.A / 5) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs font-medium tabular-nums text-foreground">{c.A.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Low-rating alerts */}
          {data.lowRatingAlerts.length > 0 && (
            <div className="rounded-lg border border-danger/40 bg-danger-bg/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <p className="text-sm font-semibold text-danger">Low-rating alerts — follow up with these patients</p>
              </div>
              <div className="space-y-2">
                {data.lowRatingAlerts.map(f => (
                  <div key={f.id} className="flex items-start gap-3 rounded-md border border-danger/20 bg-background p-3">
                    <RatingBadge rating={f.rating} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/patients/${f.patientId}`} className="text-sm font-medium text-foreground hover:underline">
                        {f.patientName}
                      </Link>
                      {f.comment && <p className="mt-0.5 text-xs text-muted-foreground">{f.comment}</p>}
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {new Date(f.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent comments */}
          {data.recent.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Recent feedback</p>
              <div className="space-y-2">
                {data.recent.map(f => (
                  <div key={f.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                    <RatingBadge rating={f.rating} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/patients/${f.patientId}`} className="text-xs font-medium text-foreground hover:underline">
                          {f.patientName}
                        </Link>
                        <p className="shrink-0 text-[10px] text-muted-foreground">
                          {new Date(f.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      {f.comment && <p className="mt-0.5 text-xs text-muted-foreground">{f.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <AddFeedbackModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load() }}
        />
      )}
    </div>
  )
}
