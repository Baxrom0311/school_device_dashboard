import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import { AlertTriangle, ShieldAlert, Wifi, WifiOff } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { useEmergencyWs } from '@/features/emergency/use-emergency-ws'

interface DeviceAlert {
  id: string
  device_id: string | null
  alert_type: string
  resolved: boolean
  created_at: string
}

const typeLabels: Record<string, string> = {
  panic: 'Panic',
  lockdown: 'Lockdown',
  emergency_ring: 'Emergency',
}

export function RecentAlerts() {
  const { status } = useEmergencyWs()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => {
      const resp = await apiClient.get<{ count: number; results: DeviceAlert[] }>(
        '/admin/emergency/',
        { params: { page_size: 5 } }
      )
      return resp.data
    },
    // Only poll as fallback when WS is disconnected
    refetchInterval: status === 'connected' ? false : 15000,
  })

  const unresolved = data?.results.filter((a) => !a.resolved) ?? []

  return (
    <Card className='col-span-3'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
          <ShieldAlert className='h-4 w-4' />
          Oxirgi alertlar
          {unresolved.length > 0 && (
            <Badge variant='destructive' className='text-xs'>
              {unresolved.length}
            </Badge>
          )}
        </CardTitle>
        <div className='flex items-center gap-2'>
          {status === 'connected' ? (
            <Wifi className='h-3 w-3 text-green-500' aria-label='Real-time ulangan' />
          ) : (
            <WifiOff className='h-3 w-3 text-muted-foreground' aria-label='Real-time uzilgan' />
          )}
          <Button variant='ghost' size='sm' asChild>
            <Link to='/emergency'>Barchasi</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            Yuklanmoqda...
          </p>
        ) : isError ? (
          <div className='flex flex-col items-center gap-2 py-4 text-center'>
            <AlertTriangle className='h-4 w-4 text-destructive' />
            <p className='text-sm text-destructive'>Alertlarni yuklashda xatolik</p>
          </div>
        ) : !data?.results.length ? (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            Alertlar yo'q
          </p>
        ) : (
          <div className='space-y-2'>
            {data.results.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className='flex items-center justify-between rounded-md border px-3 py-2 text-sm'
              >
                <div className='flex items-center gap-2'>
                  <AlertTriangle
                    className={`h-4 w-4 ${alert.resolved ? 'text-muted-foreground' : 'text-red-500'}`}
                  />
                  <span>{typeLabels[alert.alert_type] ?? alert.alert_type}</span>
                  {alert.device_id && (
                    <span className='text-xs text-muted-foreground'>
                      {alert.device_id}
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    {formatDistanceToNow(new Date(alert.created_at), {
                      addSuffix: true,
                      locale: uz,
                    })}
                  </span>
                  <Badge variant={alert.resolved ? 'secondary' : 'destructive'} className='text-xs'>
                    {alert.resolved ? 'Hal' : 'Aktiv'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
