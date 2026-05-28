import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ScheduleEntry {
  hour: number
  minute: number
  duration: number
  days: number
}

const DAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya']

function getDayNames(mask: number): string[] {
  return DAY_LABELS.filter((_, i) => mask & (1 << i))
}

interface SchedulePreviewProps {
  entries: ScheduleEntry[]
}

export function SchedulePreview({ entries }: SchedulePreviewProps) {
  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">Yozuvlar yo'q</p>
  }

  return (
    <div className="space-y-1.5 max-h-64 overflow-y-auto">
      {entries.map((entry, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
        >
          <span className="flex items-center gap-2 font-mono">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {String(entry.hour).padStart(2, '0')}:{String(entry.minute).padStart(2, '0')}
          </span>
          <div className="flex gap-1">
            {getDayNames(entry.days).map((d) => (
              <Badge key={d} variant="outline" className="px-1 py-0 text-xs">
                {d}
              </Badge>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {(entry.duration / 1000).toFixed(1)}s
          </span>
        </div>
      ))}
    </div>
  )
}
