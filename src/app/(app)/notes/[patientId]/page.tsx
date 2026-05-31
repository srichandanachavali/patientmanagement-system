'use client'
// ── F167 · src/app/(app)/notes/[patientId]/page.tsx
// Purpose: Clinical notes list + create form; calls /api/notes for fetch/create
// In: GET/POST /api/notes, GET /api/patients/:id, formatDate (F012) | Out: NotesPage | See: F012, F024

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ClinicalNote {
  id: string
  body: string
  created_at: string
  appointment_id: string
  profiles: { id: string; name: string } | null
}

export default function NotesPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const [notes, setNotes] = useState<ClinicalNote[]>([])
  const [patientName, setPatientName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Add-note form
  const [appointmentId, setAppointmentId] = useState('')
  const [body, setBody] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const fetchNotes = useCallback(() => {
    fetch(`/api/notes/${patientId}`)
      .then((r) => r.json())
      .then((data: ClinicalNote[]) => {
        setNotes(Array.isArray(data) ? data : [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [patientId])

  useEffect(() => {
    fetch(`/api/patients/${patientId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setPatientName(d.name) })

    fetchNotes()
  }, [patientId, fetchNotes])

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) {
      setAddError('Note body is required')
      return
    }
    setIsAdding(true)
    setAddError(null)

    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patientId, appointment_id: appointmentId.trim(), body }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setAddError(d.error ?? 'Failed to save note')
      setIsAdding(false)
      return
    }

    setAppointmentId('')
    setBody('')
    setIsAdding(false)
    fetchNotes()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href={`/patients/${patientId}`}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Patient Record
      </Link>

      <div>
        <h2 className="text-base font-semibold text-foreground">
          {patientName ? `${patientName} — ` : ''}Clinical Notes
        </h2>
        <p className="text-xs text-muted-foreground">Add or review consultation notes</p>
      </div>

      {/* Add note form */}
      <div className="rounded-lg border border-border bg-background p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">New Note</h3>
        <form onSubmit={handleAddNote} className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Appointment ID <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              placeholder="Paste appointment UUID if linking to an appointment"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Note
            </label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Chief complaint, observations, treatment performed…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {addError && <p className="text-xs text-danger">{addError}</p>}
          <button
            type="submit"
            disabled={isAdding}
            className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isAdding ? 'Saving…' : 'Save Note'}
          </button>
        </form>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-border bg-background p-5 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {formatDate(note.created_at)} · {note.profiles?.name ?? 'Unknown'}
              </p>

              <p className="whitespace-pre-wrap text-sm text-foreground">{note.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
