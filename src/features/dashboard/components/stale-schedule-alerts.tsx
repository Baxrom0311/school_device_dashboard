import { useQuery } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { deviceApi } from '@/features/devices/api'
import type { DeviceListItem } from '@/features/devices/types'

export function StaleScheduleAlerts() {
  const { data } = useQuery({
    queryKey: ['devices', 'stale_schedules'],
    queryFn: () => deviceApi.staleSchedules(),
    refetchInterval: 60000,
  })

  const staleDevices = data?.results.filter(
    (d: DeviceListItem) => d.schedule_stale
  ) ?? []

  const versionMismatchDevices = data?.results.filter(
    (d: DeviceListItem) =>
      !d.schedule_stale &&
      d.schedule_version != null &&
      d.device_schedule_version != null &&
      d.schedule_version > d.device_schedule_version
  ) ?? []

  if (staleDevices.length === 0 && versionMismatchDevices.length === 0) return null

  return (
    <>
      {staleDevices.length > 0 && (
        <Alert variant='default' className='mb-4 border-yellow-500'>
          <Clock className='h-4 w-4' />
          <AlertTitle>Eskirgan jadvallar</AlertTitle>
          <AlertDescription>
            {staleDevices.map((d) => (
              <Link
                key={d.id}
                to='/devices/$deviceId'
                params={{ deviceId: d.id }}
                className='mr-2 underline'
              >
                {d.device_id}
              </Link>
            ))}
            — jadval 7+ kun yangilanmagan, sinxronlash kerak
          </AlertDescription>
        </Alert>
      )}
      {versionMismatchDevices.length > 0 && (
        <Alert variant='default' className='mb-4 border-orange-500'>
          <Clock className='h-4 w-4' />
          <AlertTitle>Jadval versiya farqi</AlertTitle>
          <AlertDescription>
            {versionMismatchDevices.map((d) => (
              <Link
                key={d.id}
                to='/devices/$deviceId'
                params={{ deviceId: d.id }}
                className='mr-2 underline'
              >
                {d.device_id}
              </Link>
            ))}
            — qurilmadagi jadval eskirgan, sinxronlash kerak
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
