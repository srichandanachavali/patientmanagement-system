'use client'
// ── F183 · src/app/(app)/recalls/page.tsx
// Purpose: Recall list — patients overdue 6+ months; wa.me one-tap links with bilingual message
// In: GET /api/recalls (F072), formatDate (F012) | Out: RecallsPage | See: F072, F022
import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface RecallPatient {
  id: string
  name: string
  phone: string
  preferred_language: string
  last_visit: string | null
}

function buildWaLink(patient: RecallPatient): string {
  const clean = patient.phone.replace(/\D/g, '')
  const lastVisit = patient.last_visit ? formatDate(patient.last_visit) : 'a while'
  const text = patient.preferred_language === 'te'
    ? `నమస్కారం ${patient.name} గారు, మీరు చివరిసారి VEDA Dental Clinic కి ${lastVisit} న వచ్చారు. ఒక్కసారి Check-up కోసం రావాలని వినయంగా కోరుతున్నాం. అపాయింట్‌మెంట్ కోసం: 07660966674. ధన్యవాదాలు.`
    : `Hello ${patient.name}, your last visit to VEDA Dental Clinic was on ${lastVisit}. We recommend scheduling a check-up. Call us: 07660966674. Thank you.`
  return `https://wa.me/91${clean}?text=${encodeURIComponent(text)}`
}

export default function RecallsPage() {
  const [patients, setPatients] = useState<RecallPatient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recalls')
      .then((r) => r.json())
      .then((data) => { setPatients(Array.isArray(data) ? data : []); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Recalls</h2>
        <p className="text-xs text-muted-foreground">Patients whose last completed visit was over 6 months ago with no upcoming appointment</p>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : patients.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No patients are overdue for recall.</p>
      ) : (
        <div className="rounded-lg border border-border bg-background">
          <div className="grid grid-cols-[1fr_140px_160px] gap-3 border-b border-border bg-surface px-5 py-2.5">
            {['Patient', 'Last Visit', 'Reminder'].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {h}
              </span>
            ))}
          </div>

          {patients.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_140px_160px] gap-3 border-b border-border px-5 py-3 last:border-b-0 items-center">
              <div>
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.phone}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {p.last_visit ? formatDate(p.last_visit) : '—'}
              </span>
              <a
                href={buildWaLink(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 w-fit"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
