'use client'
// ── F193 · src/components/billing/PatientPicker.tsx
// Purpose: Debounced patient search dropdown — select an existing patient for billing/lab
// In: GET /api/patients?q= (F060) | Out: PatientPicker, PatientOption | See: F171, F173

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, User, X } from 'lucide-react'

export interface PatientOption {
  id: string
  name: string
  phone: string
}

interface PatientPickerProps {
  selected: PatientOption | null
  onSelect: (patient: PatientOption | null) => void
  label?: string
}

export function PatientPicker({ selected, onSelect, label = 'Patient' }: PatientPickerProps) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<PatientOption[]>([])
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef            = useRef<HTMLDivElement>(null)

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); setSearched(false); return }
    setLoading(true)
    fetch(`/api/patients?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        const list = Array.isArray(data) ? (data as PatientOption[]).slice(0, 8) : []
        setResults(list)
        setOpen(true)
        setSearched(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, doSearch])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (selected) {
    return (
      <div className="rounded-lg border border-success/40 bg-success/5 px-4 py-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label} selected
        </p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selected.name}</p>
              <p className="text-xs text-muted-foreground">{selected.phone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { onSelect(null); setQuery(''); setSearched(false) }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <p className="mb-1.5 text-xs font-medium text-foreground">
        {label} <span className="text-danger">*</span>
      </p>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          placeholder="Search by name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
            Searching…
          </span>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-background shadow-lg">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No saved patient found.{' '}
              <a href="/patients/new" className="text-primary hover:underline">
                Register on Patients page →
              </a>
            </div>
          ) : (
            <ul className="max-h-60 overflow-y-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onSelect(p)
                      setQuery('')
                      setOpen(false)
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-surface"
                  >
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.phone}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {searched && !open && results.length === 0 && query.trim() && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          No saved patient found for &ldquo;{query}&rdquo;.
        </p>
      )}
    </div>
  )
}
