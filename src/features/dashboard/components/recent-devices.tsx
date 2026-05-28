import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDevices } from '@/features/devices/hooks'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import { BatteryWarning, Clock, Radio, UserCheck, UserX } from 'lucide-react'

export function RecentDevices() {
  const { data, isLoading } = useDevices({ ordering: '-registered_at' })

  if (isLoading) {
    return (
      <Card className='col-span-4 lg:col-span-3'>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-4 w-60' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <Skeleton className='h-10 w-10 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-48' />
              </div>
              <Skeleton className='h-5 w-16' />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const devices = data?.results?.slice(0, 7) || []

  return (
    <Card className='col-span-4 lg:col-span-3'>
      <CardHeader>
        <CardTitle>So'nggi Qurilmalar</CardTitle>
        <CardDescription>
          Oxirgi ro'yxatdan o'tgan qurilmalar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {devices.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>
              Qurilmalar topilmadi
            </p>
          ) : (
            devices.map((device) => (
              <Link
                key={device.id}
                to='/devices/$deviceId'
                params={{ deviceId: String(device.id) }}
                className='flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors'
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  device.registration_status === 'registered' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {device.registration_status === 'registered' ? (
                    <UserCheck className='h-5 w-5' />
                  ) : (
                    <UserX className='h-5 w-5' />
                  )}
                </div>
                <div className='flex-1 space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {device.school_name || 'Noma\'lum maktab'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {device.device_id}
                  </p>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <div className='flex items-center gap-1'>
                    {(device.rtc_battery_status === 'low' || device.rtc_battery_status === 'dead') && (
                      <Badge
                        variant={device.rtc_battery_status === 'dead' ? 'destructive' : 'outline'}
                        className={`text-xs gap-1 ${device.rtc_battery_status === 'low' ? 'border-yellow-500 text-yellow-600' : ''}`}
                      >
                        <BatteryWarning className='h-3 w-3' />
                        RTC ⚠️
                      </Badge>
                    )}
                    {(device.wifi_mode === 'ap' || device.wifi_mode === 'ap_sta') && (
                      <Badge variant='outline' className='text-xs gap-1 border-orange-500 text-orange-600'>
                        <Radio className='h-3 w-3' />
                        AP
                      </Badge>
                    )}
                  </div>
                  <Badge variant={device.registration_status === 'registered' ? 'default' : 'secondary'}>
                    {device.registration_status === 'registered' ? "Ro'yxatdan o'tgan" : 'Kutilmoqda'}
                  </Badge>
                  {device.registered_at && (
                    <span className='text-xs text-muted-foreground flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      {formatDistanceToNow(new Date(device.registered_at), { 
                        addSuffix: true,
                        locale: uz 
                      })}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
