'use client'
// ── F186 · src/app/(app)/audit-log/page.tsx
// Purpose: Paginated audit log table — actor, action, entity, timestamp
// In: GET /api/audit-log (F074) | Out: AuditLogPage | See: F074

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuditEntry {
  id: string
  actor: { id: string; name: string; role: string }
  action: string
  entity: string
  entity_id: string | null
  metadata: string | null
  created_at: string
}

const ACTION_STYLE: Record<string, string> = {
  LOGIN:  'bg-info/15 text-info',
  LOGOUT: 'bg-secondary text-secondary-foreground',
  VIEW:   'bg-secondary text-secondary-foreground',
  CREATE: 'bg-success/15 text-success',
  UPDATE: 'bg-warning/15 text-warning',
  DELETE: 'bg-danger-bg text-danger',
  EXPORT: 'bg-purple-100 text-purple-800',
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  })
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/audit-log?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data.logs) ? data.logs : [])
        setTotal(data.total ?? 0)
        setPages(data.pages ?? 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {total} total entr{total === 1 ? 'y' : 'ies'}
        </p>
        {pages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-border p-1.5 text-muted-foreground hover:bg-surface disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-foreground">
              Page {page} of {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-border p-1.5 text-muted-foreground hover:bg-surface disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-border bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">No audit entries yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Entries are logged on login, patient create/update/delete, and invoice create.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">When (IST)</th>
                <th className="px-4 py-2.5 text-left font-medium">Actor</th>
                <th className="px-4 py-2.5 text-left font-medium">Action</th>
                <th className="px-4 py-2.5 text-left font-medium">Entity</th>
                <th className="px-4 py-2.5 text-left font-medium">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-surface/50">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                    {formatDateTime(e.created_at)}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{e.actor.name}</p>
                    <p className="text-[10px] text-muted-foreground">{e.actor.role}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        ACTION_STYLE[e.action] ?? 'bg-secondary text-secondary-foreground',
                      )}
                    >
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-foreground">{e.entity}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                    {e.entity_id ? e.entity_id.slice(-8) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
