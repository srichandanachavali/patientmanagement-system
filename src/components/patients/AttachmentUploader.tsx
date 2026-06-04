'use client'
// ── F148 · src/components/patients/AttachmentUploader.tsx
// Purpose: File uploader with category picker (XRAY/BEFORE/AFTER/REPORT/CONSENT/OTHER) → POST /api/patients/[id]/attachments
// In: patientId, POST /api/.../attachments (F062) | Out: AttachmentUploader | See: F142, F062

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type AttachmentCategory = 'XRAY' | 'BEFORE' | 'AFTER' | 'REPORT' | 'CONSENT' | 'OTHER'

const CATEGORIES: { value: AttachmentCategory; label: string }[] = [
  { value: 'XRAY',    label: 'X-ray' },
  { value: 'BEFORE',  label: 'Before' },
  { value: 'AFTER',   label: 'After' },
  { value: 'REPORT',  label: 'Report' },
  { value: 'CONSENT', label: 'Consent' },
  { value: 'OTHER',   label: 'Other' },
]

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp,.dcm'

interface AttachmentUploaderProps {
  patientId: string
  defaultCategory?: AttachmentCategory
}

export function AttachmentUploader({ patientId, defaultCategory = 'OTHER' }: AttachmentUploaderProps) {
  const router    = useRouter()
  const inputRef  = useRef<HTMLInputElement>(null)
  const [category,    setCategory]    = useState<AttachmentCategory>(defaultCategory)
  const [isUploading, setIsUploading] = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setIsUploading(true)

    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      form.append('category', category)

      const res = await fetch(`/api/patients/${patientId}/attachments`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? `Failed to upload ${file.name}`)
        setIsUploading(false)
        return
      }
    }

    setIsUploading(false)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {/* Category selector */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
              category === c.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="flex w-full cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed border-border bg-surface px-4 py-3 text-center hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading
          ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          : <Upload className="h-4 w-4 text-muted-foreground" />}
        <p className="text-[11px] font-medium text-foreground">
          {isUploading ? 'Uploading…' : `Upload as ${CATEGORIES.find(c => c.value === category)?.label}`}
        </p>
        <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG, WEBP · max 10 MB</p>
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
