import { useQuery } from '@tanstack/react-query'
import { BatteryWarning } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { deviceApi } from '@/features/devices/api'
import type { DeviceListItem } from '@/features/devices/types'

export function RtcBatteryAlerts() {
  const { data } = useQuery({
    queryKey: ['devices', 'rtc_errors'],
    queryFn: () => deviceApi.rtcErrors(),
    refetchInterval: 60000,
  })

  const batteryIssues = data?.results.filter(
    (d: DeviceListItem) =>
      d.rtc_battery_status === 'low' || d.rtc_battery_status === 'dead'
  ) ?? []

  if (batteryIssues.length === 0) return null

  return (
    <Alert variant='destructive' className='mb-4'>
      <BatteryWarning className='h-4 w-4' />
      <AlertTitle>RTC Batareya ogohlantirishi</AlertTitle>
      <AlertDescription>
        {batteryIssues.map((d) => (
          <Link
            key={d.id}
            to='/devices/$deviceId'
            params={{ deviceId: d.id }}
            className='mr-2 underline'
          >
            {d.device_id}
          </Link>
        ))}
        — RTC batareykasini almashtiring
      </AlertDescription>
    </Alert>
  )
}
