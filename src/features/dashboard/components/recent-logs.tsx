import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeviceLogs } from '@/features/devices/hooks'
import type { LogLevel } from '@/features/devices/types'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import { AlertCircle, AlertTriangle, Bug, Info, Zap } from 'lucide-react'

const levelConfig: Record<LogLevel, { icon: typeof Info; color: string; bg: string }> = {
  debug: { icon: Bug, color: 'text-gray-500', bg: 'bg-gray-100' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
  critical: { icon: Zap, color: 'text-red-700', bg: 'bg-red-200' },
}

const levelLabels: Record<LogLevel, string> = {
  debug: 'Debug',
  info: 'Info',
  warning: 'Ogohlantirish',
  error: 'Xatolik',
  critical: 'Kritik',
}

export function RecentLogs() {
  const { data, isLoading } = useDeviceLogs({ ordering: '-created_at' })

  if (isLoading) {
    return (
      <Card className='col-span-4 lg:col-span-3'>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-4 w-60' />
        </CardHeader>
        <CardContent className='space-y-3'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex items-start gap-3'>
              <Skeleton className='h-8 w-8 rounded' />
              <div className='flex-1 space-y-1'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-3 w-24' />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const logs = data?.results?.slice(0, 8) || []

  return (
    <Card className='col-span-4 lg:col-span-3'>
      <CardHeader>
        <CardTitle>So'nggi Loglar</CardTitle>
        <CardDescription>
          Qurilmalardan kelgan xabarlar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {logs.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>
              Loglar topilmadi
            </p>
          ) : (
            logs.map((log) => {
              const config = levelConfig[log.level]
              const Icon = config.icon
              
              return (
                <div key={log.id} className='flex items-start gap-3'>
                  <div className={`flex h-8 w-8 items-center justify-center rounded ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm leading-snug line-clamp-2'>
                      {log.message}
                    </p>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Badge variant='outline' className='text-xs py-0'>
                        {log.device_id}
                      </Badge>
                      <span>•</span>
                      <Badge 
                        variant='secondary' 
                        className={`text-xs py-0 ${config.color}`}
                      >
                        {levelLabels[log.level]}
                      </Badge>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(log.created_at), { 
                          addSuffix: true,
                          locale: uz 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
