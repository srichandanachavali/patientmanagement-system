// ── F012 · src/lib/utils.ts
// Purpose: Shared utility functions — cn, formatCurrency, formatDate, formatTime (IST-aware)
// In: — | Out: cn, formatCurrency, formatDate, formatTime | See: —
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formats a number as Indian Rupees (₹1,23,456.00)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Formats an ISO date string in IST (Asia/Kolkata, UTC+5:30)
// Default output: "23 May 2026" — pass options to override
export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' },
): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options,
  }).format(new Date(iso))
}

// Formats an ISO datetime string as a short time in IST (e.g. "9:30 AM")
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}
