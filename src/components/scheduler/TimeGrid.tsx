// ── F154 · src/components/scheduler/TimeGrid.tsx
// Purpose: Time ruler column (30-min labels) + SlotLines overlay (15-min grid lines per chair column)
// In: dayStart/dayEnd HH:MM strings | Out: TimeGrid, SlotLines | See: F153

const HOUR_HEIGHT = 64

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function formatLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${h12} ${period}` : `${h12}:${m.toString().padStart(2, '0')}`
}

interface TimeGridProps {
  dayStart: string  // "09:30"
  dayEnd: string    // "21:00"
}

export function TimeGrid({ dayStart, dayEnd }: TimeGridProps) {
  const startMin = toMinutes(dayStart)
  const endMin = toMinutes(dayEnd)
  const totalHeight = ((endMin - startMin) / 60) * HOUR_HEIGHT

  const labels: number[] = []
  for (let m = startMin; m <= endMin; m += 30) {
    labels.push(m)
  }

  return (
    <div className="relative w-14 shrink-0 border-r border-border" style={{ height: totalHeight }}>
      {labels.map((slotMin) => {
        const top = ((slotMin - startMin) / 60) * HOUR_HEIGHT
        return (
          <div
            key={slotMin}
            className="absolute right-2 text-[10px] leading-none text-muted-foreground"
            style={{ top: top - 6 }}
          >
            {formatLabel(slotMin)}
          </div>
        )
      })}
    </div>
  )
}

// Slot line overlay — rendered inside each chair column
export function SlotLines({ dayStart, dayEnd }: { dayStart: string; dayEnd: string }) {
  const startMin = toMinutes(dayStart)
  const endMin = toMinutes(dayEnd)

  const slots: number[] = []
  for (let m = startMin; m < endMin; m += 15) {
    slots.push(m)
  }

  return (
    <>
      {slots.map((slotMin) => {
        const top = ((slotMin - startMin) / 60) * HOUR_HEIGHT
        const isHour = slotMin % 60 === 0
        const isHalf = slotMin % 30 === 0
        return (
          <div
            key={slotMin}
            className="pointer-events-none absolute inset-x-0 border-t"
            style={{
              top,
              borderColor: isHour
                ? 'hsl(var(--border))'
                : isHalf
                  ? 'hsl(var(--border) / 0.5)'
                  : 'hsl(var(--border) / 0.2)',
            }}
          />
        )
      })}
    </>
  )
}
