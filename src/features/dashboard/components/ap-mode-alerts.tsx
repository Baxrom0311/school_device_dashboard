import { useQuery } from '@tanstack/react-query'
import { Radio } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { deviceApi } from '@/features/devices/api'

export function ApModeAlerts() {
  const { data } = useQuery({
    queryKey: ['devices', 'ap_mode'],
    queryFn: () => deviceApi.apMode(),
    refetchInterval: 30000,
  })

  const apDevices = data?.results.filter(
    (d) => d.wifi_mode === 'ap' || d.wifi_mode === 'ap_sta'
  ) ?? []

  if (apDevices.length === 0) return null

  return (
    <Alert variant='default' className='mb-4 border-orange-500'>
      <Radio className='h-4 w-4' />
      <AlertTitle>WiFi sozlash kerak</AlertTitle>
      <AlertDescription>
        {apDevices.map((d) => (
          <Link
            key={d.id}
            to='/devices/$deviceId'
            params={{ deviceId: d.id }}
            className='mr-2 underline'
          >
            {d.device_id}
          </Link>
        ))}
        — AP mode'da, WiFi sozlash uchun qurilmaga ulaning
      </AlertDescription>
    </Alert>
  )
}
