import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScheduleEntry {
  hour: number
  minute: number
  duration: number
  days: number
}

const DAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya']

interface WeeklyScheduleViewProps {
  entries: ScheduleEntry[]
}

export function WeeklyScheduleView({ entries }: WeeklyScheduleViewProps) {
  // Group entries by day
  const byDay: Record<number, ScheduleEntry[]> = {}
  for (let d = 0; d < 7; d++) byDay[d] = []

  for (const entry of entries) {
    for (let d = 0; d < 7; d++) {
      if (entry.days & (1 << d)) {
        byDay[d].push(entry)
      }
    }
  }

  // Sort each day's entries by time
  for (const d of Object.keys(byDay)) {
    byDay[Number(d)].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
  }

  const maxEntries = Math.max(...Object.values(byDay).map((e) => e.length), 1)

  if (!entries.length) {
    return (
      <Card>
        <CardContent className='py-6'>
          <p className='text-center text-sm text-muted-foreground'>
            Jadval yozuvlari yo'q
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
          <Clock className='h-4 w-4' />
          Haftalik ko'rinish
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-7 gap-1'>
          {/* Day headers */}
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className='rounded-t-md bg-muted px-1 py-1.5 text-center text-xs font-medium'
            >
              {label}
            </div>
          ))}
          {/* Time slots */}
          {Array.from({ length: maxEntries }, (_, row) =>
            DAY_LABELS.map((_, col) => {
              const entry = byDay[col][row]
              if (!entry) {
                return <div key={`${row}-${col}`} className='min-h-[28px]' />
              }
              return (
                <div
                  key={`${row}-${col}`}
                  className='flex min-h-[28px] items-center justify-center rounded-sm bg-primary/10 text-xs font-mono'
                >
                  {String(entry.hour).padStart(2, '0')}:{String(entry.minute).padStart(2, '0')}
                </div>
              )
            })
          )}
        </div>
        <p className='mt-2 text-xs text-muted-foreground text-center'>
          Jami: {entries.length} ta yozuv
        </p>
      </CardContent>
    </Card>
  )
}
