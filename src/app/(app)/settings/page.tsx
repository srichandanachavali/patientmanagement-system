'use client'
// ── F185 · src/app/(app)/settings/page.tsx
// Purpose: Clinic settings form — name, phone, address, hours, GST, chair count, UPI, branding
// In: GET/PATCH /api/settings (F073) | Out: SettingsPage | See: F073, F026, F030

import { useState, useEffect, useCallback } from 'react'
import type { ClinicSettings, ClinicHours, DayHours } from '@/types'

const DAYS: { key: keyof ClinicHours; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </h2>
  )
}

function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'

export default function SettingsPage() {
  const [form, setForm] = useState<ClinicSettings | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: ClinicSettings) => { setForm(data); setStatus('idle') })
      .catch(() => { setStatus('error'); setErrorMsg('Failed to load settings.') })
  }, [])

  const set = useCallback(<K extends keyof ClinicSettings>(key: K, value: ClinicSettings[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
  }, [])

  const setHour = useCallback((day: keyof ClinicHours, field: keyof DayHours, value: string) => {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        hours_json: {
          ...prev.hours_json,
          [day]: { ...prev.hours_json[day], [field]: value },
        },
      }
    })
  }, [])

  const handleSave = async () => {
    if (!form) return
    setStatus('saving')
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error ?? 'Save failed')
      }
      const updated: ClinicSettings = await res.json()
      setForm(updated)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Save failed')
    }
  }

  if (status === 'loading') {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading settings…</p>
  }

  if (!form) {
    return (
      <div className="rounded-md bg-danger-bg p-4 text-sm text-danger">
        {errorMsg || 'Settings not found. Run npm run db:seed to initialise.'}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      {/* ── Clinic Info ── */}
      <section className="rounded-lg border border-border bg-background p-6">
        <SectionHeading title="Clinic Information" />
        <div className="space-y-4">
          <Field label="Clinic name">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </Field>
          <Field label="Phone number">
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </Field>
          <Field label="Address">
            <textarea
              className={inputCls + ' min-h-[72px] resize-y'}
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* ── Operating Hours ── */}
      <section className="rounded-lg border border-border bg-background p-6">
        <SectionHeading title="Operating Hours" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Day</th>
                <th className="pb-2 font-medium">Open</th>
                <th className="pb-2 font-medium">Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DAYS.map(({ key, label }) => (
                <tr key={key}>
                  <td className="py-2 pr-4 text-sm font-medium text-foreground w-32">{label}</td>
                  <td className="py-2 pr-3">
                    <input
                      type="time"
                      className={inputCls + ' w-32'}
                      value={form.hours_json[key]?.open ?? '09:30'}
                      onChange={(e) => setHour(key, 'open', e.target.value)}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="time"
                      className={inputCls + ' w-32'}
                      value={form.hours_json[key]?.close ?? '21:00'}
                      onChange={(e) => setHour(key, 'close', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Billing ── */}
      <section className="rounded-lg border border-border bg-background p-6">
        <SectionHeading title="Billing & Operations" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="GST rate (%)">
            <input
              type="number"
              min={0}
              max={28}
              step={0.5}
              className={inputCls}
              value={form.gst_rate}
              onChange={(e) => set('gst_rate', Number(e.target.value))}
            />
          </Field>
          <Field label="Chair count">
            <input
              type="number"
              min={1}
              max={20}
              className={inputCls}
              value={form.chair_count}
              onChange={(e) => set('chair_count', Number(e.target.value))}
            />
          </Field>
        </div>
      </section>

      {/* ── Payments ── */}
      <section className="rounded-lg border border-border bg-background p-6">
        <SectionHeading title="UPI / Payments" />
        <div className="space-y-4">
          <Field label="UPI VPA (e.g. vedadental@upi)">
            <input
              className={inputCls}
              value={form.upi_vpa}
              onChange={(e) => set('upi_vpa', e.target.value)}
            />
          </Field>
          <Field label="UPI payee display name">
            <input
              className={inputCls}
              value={form.upi_payee_name}
              onChange={(e) => set('upi_payee_name', e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* ── Branding ── */}
      <section className="rounded-lg border border-border bg-background p-6">
        <SectionHeading title="Branding" />
        <Field label="Accent colour">
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="h-9 w-16 cursor-pointer rounded border border-border bg-background p-0.5"
              value={form.brand_color}
              onChange={(e) => set('brand_color', e.target.value)}
            />
            <input
              className={inputCls + ' w-32 font-mono'}
              value={form.brand_color}
              onChange={(e) => set('brand_color', e.target.value)}
            />
          </div>
        </Field>
      </section>

      {/* ── Save bar ── */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save settings'}
        </button>
        {status === 'saved' && (
          <span className="text-sm text-success">Settings saved.</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-danger">{errorMsg}</span>
        )}
      </div>
    </div>
  )
}
