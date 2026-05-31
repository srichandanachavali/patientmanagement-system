// ── F100 · src/app/layout.tsx
// Purpose: Root HTML shell — Inter + JetBrains Mono font variables + global CSS import
// In: — | Out: RootLayout | See: F101, F102
import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'VEDA Dental PMS',
  description: 'VEDA Super Speciality Dental Clinic — Patient Management System',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
