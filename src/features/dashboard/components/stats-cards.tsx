import { AlertTriangle, Clock, Cpu, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeviceStats } from '@/features/devices/hooks'

export function StatsCards() {
  const { data: stats, isLoading } = useDeviceStats()

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='mb-1 h-8 w-16' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const registeredPercent = stats?.total_devices
    ? Math.round((stats.registered_devices / stats.total_devices) * 100)
    : 0

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Jami Qurilmalar</CardTitle>
          <Cpu className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats?.total_devices || 0}</div>
          <p className='text-xs text-muted-foreground'>
            Ro'yxatdagi barcha qurilmalar
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Ro'yxatdan o'tgan
          </CardTitle>
          <UserCheck className='h-4 w-4 text-green-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>
            {stats?.registered_devices || 0}
          </div>
          <p className='text-xs text-muted-foreground'>
            {registeredPercent}% qurilmalar tasdiqlangan
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Kutilmoqda</CardTitle>
          <Clock className='h-4 w-4 text-yellow-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-yellow-600'>
            {stats?.pending_devices || 0}
          </div>
          <p className='text-xs text-muted-foreground'>
            Tasdiqlanmagan qurilmalar
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>RTC Xatoliklar</CardTitle>
          <AlertTriangle className='h-4 w-4 text-yellow-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-yellow-600'>
            {stats?.rtc_errors || 0}
          </div>
          <p className='text-xs text-muted-foreground'>
            Vaqt sinxronizatsiya muammolari
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
