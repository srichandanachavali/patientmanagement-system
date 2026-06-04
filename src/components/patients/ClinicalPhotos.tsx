'use client'
// ── F208 · src/components/patients/ClinicalPhotos.tsx
// Purpose: Clinical photo gallery with lightbox — BEFORE / AFTER / XRAY grid + inline image viewer
// In: photos (Attachment[]) | Out: ClinicalPhotos | See: F142, F148

import { useState } from 'react'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORY_LABEL: Record<string, string> = {
  XRAY:   'X-ray',
  BEFORE: 'Before',
  AFTER:  'After',
}

const CATEGORY_CLS: Record<string, string> = {
  XRAY:   'bg-blue-50 text-blue-700 border-blue-200',
  BEFORE: 'bg-amber-50 text-amber-700 border-amber-200',
  AFTER:  'bg-green-50 text-green-700 border-green-200',
}

interface Photo {
  id: string
  fileName: string
  storagePath: string
  category: string
  uploadedAt: Date
}

function isImage(path: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(path)
}

export function ClinicalPhotos({ photos }: { photos: Photo[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const imagePhotos = photos.filter(p =>
    ['XRAY', 'BEFORE', 'AFTER'].includes(p.category) && isImage(p.storagePath)
  )

  if (imagePhotos.length === 0) return null

  const open  = (i: number) => setLightboxIdx(i)
  const close = () => setLightboxIdx(null)
  const prev  = () => setLightboxIdx(i => i !== null ? (i - 1 + imagePhotos.length) % imagePhotos.length : null)
  const next  = () => setLightboxIdx(i => i !== null ? (i + 1) % imagePhotos.length : null)

  const current = lightboxIdx !== null ? imagePhotos[lightboxIdx] : null

  return (
    <>
      <div className="rounded-lg border border-border bg-background">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Clinical Photos</h3>
          <p className="text-[11px] text-muted-foreground">X-rays, before &amp; after images</p>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-4">
          {imagePhotos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => open(i)}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.storagePath}
                alt={photo.fileName}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {/* Category badge */}
              <span className={cn(
                'absolute left-1 top-1 rounded border px-1.5 py-0.5 text-[9px] font-semibold leading-none',
                CATEGORY_CLS[photo.category] ?? 'bg-secondary text-secondary-foreground border-border',
              )}>
                {CATEGORY_LABEL[photo.category] ?? photo.category}
              </span>
              {/* Zoom hint */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                <ZoomIn className="h-5 w-5 text-white opacity-0 drop-shadow group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={close}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.storagePath}
              alt={current.fileName}
              className="max-h-[80vh] w-full rounded-lg object-contain shadow-2xl"
            />

            {/* Meta bar */}
            <div className="mt-2 flex items-center justify-between">
              <span className={cn(
                'rounded border px-2 py-0.5 text-xs font-semibold',
                CATEGORY_CLS[current.category] ?? 'bg-secondary text-secondary-foreground border-border',
              )}>
                {CATEGORY_LABEL[current.category] ?? current.category}
              </span>
              <span className="text-xs text-white/70">{current.fileName}</span>
              <span className="text-xs text-white/70">
                {new Date(current.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Prev / next */}
            {imagePhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/40"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/40"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <p className="mt-1 text-center text-xs text-white/50">
                  {(lightboxIdx ?? 0) + 1} / {imagePhotos.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
