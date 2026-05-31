'use client'
// ── F175 · src/components/billing/PdfDownloadButton.tsx
// Purpose: Client download button — renders InvoicePDF on demand via usePDF hook
// In: pdfProps (InvoicePDFProps), fileName | Out: PdfDownloadButton | See: F174, F172

import { usePDF } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'
import { InvoicePDF, type InvoicePDFProps } from './InvoicePDF'

interface PdfDownloadButtonProps {
  pdfProps: InvoicePDFProps
  fileName: string
}

export function PdfDownloadButton({ pdfProps, fileName }: PdfDownloadButtonProps) {
  const [instance] = usePDF({ document: <InvoicePDF {...pdfProps} /> })

  if (instance.loading) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground opacity-60"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Generating…
      </button>
    )
  }

  return (
    <a
      href={instance.url ?? '#'}
      download={fileName}
      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
    >
      <Download className="h-3.5 w-3.5" />
      Download PDF
    </a>
  )
}
