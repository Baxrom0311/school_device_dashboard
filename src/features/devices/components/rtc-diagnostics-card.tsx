import { format } from 'date-fns'
import {
  Battery,
  BatteryWarning,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRtcDiagnostics } from '@/features/devices/hooks'
import type { RtcBatteryStatus } from '@/features/devices/types'

interface RtcDiagnosticsCardProps {
  deviceId: string
  currentDrift?: number | null
  batteryStatus?: RtcBatteryStatus
}

const batteryLabels: Record<RtcBatteryStatus, { label: string; className: string }> = {
  ok: { label: 'Yaxshi', className: 'text-green-600' },
  low: { label: 'Zaiflashgan', className: 'text-yellow-600' },
  dead: { label: "O'lgan", className: 'text-red-600' },
  unknown: { label: "Noma'lum", className: 'text-muted-foreground' },
}

export function RtcDiagnosticsCard({ deviceId, currentDrift, batteryStatus }: RtcDiagnosticsCardProps) {
  const { data: history } = useRtcDiagnostics(deviceId)

  const status = batteryStatus ?? 'unknown'
  const config = batteryLabels[status]

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Clock className='h-5 w-5' />
          RTC Diagnostika
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Current status */}
        <div className='grid gap-4 sm:grid-cols-3'>
          <div className='flex items-center gap-3 rounded-md border p-3'>
            {status === 'ok' ? (
              <Battery className='h-5 w-5 text-green-500' />
            ) : (
              <BatteryWarning className={`h-5 w-5 ${status === 'dead' ? 'text-red-500' : 'text-yellow-500'}`} />
            )}
            <div>
              <p className='text-xs text-muted-foreground'>Batareya</p>
              <p className={`text-sm font-semibold ${config.className}`}>{config.label}</p>
            </div>
          </div>
          <div className='flex items-center gap-3 rounded-md border p-3'>
            <TrendingUp className='h-5 w-5 text-blue-500' />
            <div>
              <p className='text-xs text-muted-foreground'>Joriy drift</p>
              <p className='text-sm font-semibold'>
                {currentDrift != null ? `${currentDrift}s` : '—'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-3 rounded-md border p-3'>
            <Clock className='h-5 w-5 text-purple-500' />
            <div>
              <p className='text-xs text-muted-foreground'>Holat</p>
              {currentDrift != null && currentDrift > 300 ? (
                <Badge variant='destructive' className='text-xs'>Xavfli</Badge>
              ) : currentDrift != null && currentDrift > 30 ? (
                <Badge variant='outline' className='border-yellow-500 text-yellow-600 text-xs'>Ogohlantirish</Badge>
              ) : (
                <Badge variant='outline' className='border-green-500 text-green-600 text-xs'>Normal</Badge>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        {history && history.length > 0 && (
          <div>
            <p className='mb-2 text-sm font-medium text-muted-foreground'>Oxirgi tekshiruvlar</p>
            <div className='max-h-40 space-y-1.5 overflow-y-auto'>
              {history.slice(0, 7).map((entry) => (
                <div
                  key={entry.id}
                  className='flex items-center justify-between rounded-md border px-3 py-1.5 text-sm'
                >
                  <span className='text-xs text-muted-foreground'>
                    {format(new Date(entry.checked_at), 'dd.MM HH:mm')}
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className={`text-xs font-mono ${entry.drift_sec > 300 ? 'text-red-600' : entry.drift_sec > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {entry.drift_sec}s
                    </span>
                    {(entry.battery_status === 'low' || entry.battery_status === 'dead') && (
                      <BatteryWarning className={`h-3 w-3 ${entry.battery_status === 'dead' ? 'text-red-500' : 'text-yellow-500'}`} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
