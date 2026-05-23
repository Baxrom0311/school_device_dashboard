import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  Info,
  RefreshCw,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useDeviceLogs } from '@/features/devices/hooks'
import type { LogLevel, LogSource } from '@/features/devices/types'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: false },
  { title: 'Loglar', href: '/device-logs', isActive: true },
  { title: 'Firmware', href: '/firmware', isActive: false },
]

const levelConfig: Record<
  LogLevel,
  { icon: typeof Info; color: string; bg: string; label: string }
> = {
  debug: { icon: Bug, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Debug' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Info' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Ogohlantirish' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Xatolik' },
  critical: { icon: Zap, color: 'text-red-700', bg: 'bg-red-200 dark:bg-red-900/50', label: 'Kritik' },
}

const sourceLabels: Record<LogSource, string> = {
  device: 'Qurilma',
  server: 'Server',
  ota: 'OTA',
  mqtt: 'MQTT',
}

export function DeviceLogsPage() {
  const [level, setLevel] = useState<string>('all')
  const [source, setSource] = useState<string>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, refetch } = useDeviceLogs({
    page,
    ordering: '-created_at',
    ...(level !== 'all' && { level }),
    ...(source !== 'all' && { source }),
  })

  const logs = data?.results || []
  const totalPages = data ? Math.ceil(data.count / 20) : 0

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Qurilma Loglari
            </h1>
            <p className='text-muted-foreground'>
              {data?.count ?? 0} ta log yozuvi
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Yangilash
          </Button>
        </div>

        {/* Filters */}
        <div className='mb-4 flex flex-wrap gap-3'>
          <Select value={level} onValueChange={(v) => { setLevel(v); setPage(1) }}>
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Daraja' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Barcha darajalar</SelectItem>
              <SelectItem value='debug'>Debug</SelectItem>
              <SelectItem value='info'>Info</SelectItem>
              <SelectItem value='warning'>Warning</SelectItem>
              <SelectItem value='error'>Error</SelectItem>
              <SelectItem value='critical'>Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={source} onValueChange={(v) => { setSource(v); setPage(1) }}>
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Manba' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Barcha manbalar</SelectItem>
              <SelectItem value='device'>Qurilma</SelectItem>
              <SelectItem value='server'>Server</SelectItem>
              <SelectItem value='ota'>OTA</SelectItem>
              <SelectItem value='mqtt'>MQTT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Loglar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='space-y-3'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className='flex items-start gap-3'>
                    <Skeleton className='h-8 w-8 rounded' />
                    <div className='flex-1 space-y-1'>
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-3 w-48' />
                    </div>
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <p className='py-8 text-center text-muted-foreground'>
                Loglar topilmadi
              </p>
            ) : (
              <div className='space-y-3'>
                {logs.map((log) => {
                  const config = levelConfig[log.level]
                  const Icon = config.icon

                  return (
                    <div
                      key={log.id}
                      className='flex items-start gap-3 rounded-md border p-3'
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${config.bg}`}
                      >
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm leading-snug'>{log.message}</p>
                        <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                          <Badge variant='outline' className='py-0 text-xs'>
                            {log.device_id}
                          </Badge>
                          <Badge
                            variant='secondary'
                            className={`py-0 text-xs ${config.color}`}
                          >
                            {config.label}
                          </Badge>
                          <Badge variant='secondary' className='py-0 text-xs'>
                            {sourceLabels[log.source]}
                          </Badge>
                          <span>
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                              locale: uz,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-4 flex items-center justify-between'>
                <p className='text-sm text-muted-foreground'>
                  Sahifa {page} / {totalPages}
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Oldingi
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Keyingi
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
