'use client'
// ── F176 · src/components/billing/UpiQrCode.tsx
// Purpose: UPI QR code — buildUpiLink inlined (no external dep); UpiQrCode canvas component + buildUpiQrDataUrl for PDF
// In: vpa, payeeName, amount, note | Out: UpiQrCode, buildUpiQrDataUrl | See: F172, F174

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface UpiPayload {
  vpa: string
  name: string
  amount?: number
  note?: string
}

function buildUpiLink({ vpa, name, amount, note }: UpiPayload): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name,
    cu: 'INR',
    ...(amount != null ? { am: amount.toFixed(2) } : {}),
    ...(note ? { tn: note } : {}),
  })
  return `upi://pay?${params.toString()}`
}

interface UpiQrCodeProps {
  vpa: string
  payeeName: string
  amount: number
  note?: string
  size?: number
}

export function UpiQrCode({ vpa, payeeName, amount, note, size = 120 }: UpiQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const link = buildUpiLink({ vpa, name: payeeName, amount, note })
    QRCode.toCanvas(canvasRef.current, link, {
      width: size,
      margin: 1,
      color: { dark: '#111827', light: '#FFFFFF' },
    })
  }, [vpa, payeeName, amount, note, size])

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas ref={canvasRef} width={size} height={size} className="rounded border border-border" />
      <p className="text-[10px] text-muted-foreground">Scan to pay · UPI</p>
      <p className="font-mono text-[10px] text-muted-foreground">{vpa}</p>
    </div>
  )
}

export async function buildUpiQrDataUrl(
  vpa: string,
  payeeName: string,
  amount: number,
  note?: string,
): Promise<string> {
  const link = buildUpiLink({ vpa, name: payeeName, amount, note })
  return QRCode.toDataURL(link, { width: 150, margin: 1 })
}
