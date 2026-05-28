import { useQuery } from '@tanstack/react-query'
import { Activity, AlertTriangle, Circle, Wifi, WifiOff } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deviceApi } from '@/features/devices/api'

export function DeviceHealthOverview() {
  const { data: statusList, isError } = useQuery({
    queryKey: ['devices', 'status-poll'],
    queryFn: () => deviceApi.statusPoll(),
    refetchInterval: 10000,
  })

  const total = statusList?.length ?? 0
  const online = statusList?.filter((d) => {
    if (!d.last_seen) return false
    const diff = Date.now() - new Date(d.last_seen).getTime()
    return diff < 5 * 60 * 1000 // 5 min
  }).length ?? 0
  const offline = total - online

  return (
    <Card className='col-span-3'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
          <Activity className='h-4 w-4' />
          Qurilmalar holati
        </CardTitle>
        <Button variant='ghost' size='sm' asChild>
          <Link to='/devices'>Barchasi</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className='flex flex-col items-center gap-2 py-6 text-center'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
            <p className='text-sm text-destructive'>Qurilmalar holatini yuklashda xatolik</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-3 gap-4'>
              <div className='flex flex-col items-center gap-1 rounded-md border p-3'>
                <span className='text-2xl font-bold'>{total}</span>
                <span className='text-xs text-muted-foreground'>Jami</span>
              </div>
              <div className='flex flex-col items-center gap-1 rounded-md border p-3'>
                <div className='flex items-center gap-1'>
                  <Circle className='h-2.5 w-2.5 fill-green-500 text-green-500' />
                  <span className='text-2xl font-bold text-green-600'>{online}</span>
                </div>
                <span className='text-xs text-muted-foreground'>Online</span>
              </div>
              <div className='flex flex-col items-center gap-1 rounded-md border p-3'>
                <div className='flex items-center gap-1'>
                  <Circle className='h-2.5 w-2.5 fill-red-500 text-red-500' />
                  <span className='text-2xl font-bold text-red-600'>{offline}</span>
                </div>
                <span className='text-xs text-muted-foreground'>Offline</span>
              </div>
            </div>

            {statusList && statusList.length > 0 && (
              <div className='mt-4 space-y-1.5 max-h-48 overflow-y-auto'>
                {statusList
                  .sort((a, b) => {
                    const aTime = a.last_seen ? new Date(a.last_seen).getTime() : 0
                    const bTime = b.last_seen ? new Date(b.last_seen).getTime() : 0
                    return bTime - aTime
                  })
                  .slice(0, 6)
                  .map((device) => {
                    const isOnline = device.last_seen && Date.now() - new Date(device.last_seen).getTime() < 5 * 60 * 1000
                    return (
                      <div
                        key={device.id}
                        className='flex items-center justify-between rounded-md border px-3 py-1.5 text-sm'
                      >
                        <div className='flex items-center gap-2'>
                          {isOnline ? (
                            <Wifi className='h-3.5 w-3.5 text-green-500' />
                          ) : (
                            <WifiOff className='h-3.5 w-3.5 text-red-500' />
                          )}
                          <span className='font-mono text-xs'>{device.device_id}</span>
                        </div>
                        <Badge variant={isOnline ? 'default' : 'destructive'} className='text-xs'>
                          {isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    )
                  })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
