'use client'
// ── F148 · src/components/patients/AttachmentUploader.tsx
// Purpose: Drag-and-drop + click file uploader → POST /api/patients/[id]/attachments; calls router.refresh() on success
// In: patientId string, POST /api/.../attachments (F062) | Out: AttachmentUploader | See: F142, F062

import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AttachmentUploaderProps {
  patientId: string
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp,.dcm'

export function AttachmentUploader({ patientId }: AttachmentUploaderProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setIsUploading(true)

    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)

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
    <div>
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
        className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed border-border bg-surface px-4 py-4 text-center hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-5 w-5 text-muted-foreground" />
        )}
        <p className="text-xs font-medium text-foreground">
          {isUploading ? 'Uploading…' : 'Click or drag files here'}
        </p>
        <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG, WEBP, DICOM · max 10 MB</p>
      </button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  )
}
