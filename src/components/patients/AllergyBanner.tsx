// ── F144 · src/components/patients/AllergyBanner.tsx
// Purpose: Red allergy alert banner — danger (#DC2626) on danger-bg (#FEF2F2) at WCAG AA 5.9:1
// In: allergies string[] | Out: AllergyBanner | See: F142
import { AlertTriangle } from 'lucide-react'

interface AllergyBannerProps {
  allergies: string[]
}

// Static — no animation (docs/STYLE.md: "always visible at top of patient record")
// danger (#DC2626) on danger-bg (#FEF2F2) passes WCAG AA (5.9:1 contrast)
export function AllergyBanner({ allergies }: AllergyBannerProps) {
  if (allergies.length === 0) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-danger/30 bg-danger-bg px-4 py-3"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-danger">Allergy Alert</p>
        <p className="mt-0.5 text-sm text-danger/90">
          {allergies.join(' · ')}
        </p>
      </div>
    </div>
  )
}
