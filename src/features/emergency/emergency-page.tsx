import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import {
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  ShieldOff,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { apiClient } from '@/lib/api-client'
import { useEmergencyWs } from './use-emergency-ws'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: false },
  { title: 'Favqulodda', href: '/emergency', isActive: true },
]

interface DeviceAlert {
  id: string
  device_id: string | null
  alert_type: 'panic' | 'lockdown' | 'emergency_ring'
  resolved: boolean
  resolved_at: string | null
  created_at: string
}

interface PaginatedAlerts {
  count: number
  results: DeviceAlert[]
}

const alertTypeLabels: Record<string, { label: string; color: string }> = {
  panic: { label: 'Panic', color: 'text-red-600' },
  lockdown: { label: 'Lockdown', color: 'text-orange-600' },
  emergency_ring: { label: 'Emergency Ring', color: 'text-yellow-600' },
}

export function EmergencyPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const { status: wsStatus } = useEmergencyWs()

  const { data: alerts, isLoading, isError } = useQuery({
    queryKey: ['emergency-alerts', page],
    queryFn: async () => {
      const resp = await apiClient.get<PaginatedAlerts>('/admin/emergency/', {
        params: { page, page_size: 20 },
      })
      return resp.data
    },
    refetchInterval: wsStatus === 'connected' ? false : 30000,
  })

  const totalPages = alerts ? Math.ceil(alerts.count / 20) : 0

  const ringAll = useMutation({
    mutationFn: async () => {
      const resp = await apiClient.post('/admin/emergency/ring-all/', {
        duration: 30,
      })
      return resp.data
    },
    onSuccess: (data) => {
      toast.success(
        `Favqulodda signal yuborildi: ${data.total} qurilmaga`
      )
      queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] })
    },
    onError: () => toast.error('Signal yuborishda xatolik'),
  })

  const lockdown = useMutation({
    mutationFn: async () => {
      const resp = await apiClient.post('/admin/emergency/lockdown/', {
        state: true,
      })
      return resp.data
    },
    onSuccess: (data) => {
      toast.success(`Lockdown yoqildi: ${data.total} qurilmaga`)
      queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] })
    },
    onError: () => toast.error('Lockdown yoqishda xatolik'),
  })

  const cancel = useMutation({
    mutationFn: async () => {
      const resp = await apiClient.post('/admin/emergency/cancel/')
      return resp.data
    },
    onSuccess: (data) => {
      toast.success(
        `Bekor qilindi: ${data.resolved_alerts} alert hal qilindi`
      )
      queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] })
    },
    onError: () => toast.error('Bekor qilishda xatolik'),
  })

  const unresolvedCount =
    alerts?.results.filter((a) => !a.resolved).length ?? 0

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
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              🚨 Favqulodda Boshqaruv
            </h1>
            <p className='text-muted-foreground'>
              Xavfsizlik signalizatsiya va favqulodda buyruqlar
            </p>
          </div>
          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
            {wsStatus === 'connected' ? (
              <><Wifi className='h-3.5 w-3.5 text-green-500' /> Real-time</>
            ) : (
              <><WifiOff className='h-3.5 w-3.5' /> Polling</>
            )}
          </div>
        </div>

        {/* Emergency Action Buttons */}
        <div className='mb-8 grid gap-4 sm:grid-cols-3'>
          {/* Ring All */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                size='lg'
                className='h-24 w-full text-lg'
                disabled={ringAll.isPending}
              >
                {ringAll.isPending ? <Loader2 className='mr-3 h-6 w-6 animate-spin' /> : <Bell className='mr-3 h-6 w-6' />}
                Barcha qurilmalarga signal
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Favqulodda signal</AlertDialogTitle>
                <AlertDialogDescription>
                  Barcha aktiv qurilmalarga 30 soniyalik signal yuboriladi. Bu
                  amalni tasdiqlaysizmi?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => ringAll.mutate()}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  Tasdiqlash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Lockdown */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                size='lg'
                className='h-24 w-full bg-orange-600 text-lg hover:bg-orange-700'
                disabled={lockdown.isPending}
              >
                {lockdown.isPending ? <Loader2 className='mr-3 h-6 w-6 animate-spin' /> : <Lock className='mr-3 h-6 w-6' />}
                Lockdown
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Lockdown rejimi</AlertDialogTitle>
                <AlertDialogDescription>
                  Barcha qurilmalarda ikkinchi relay (eshik qulfi) yoqiladi. Bu
                  amalni tasdiqlaysizmi?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => lockdown.mutate()}
                  className='bg-orange-600 text-white hover:bg-orange-700'
                >
                  Tasdiqlash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Cancel */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                size='lg'
                className='h-24 w-full border-green-500 text-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                disabled={cancel.isPending}
              >
                {cancel.isPending ? <Loader2 className='mr-3 h-6 w-6 animate-spin' /> : <ShieldOff className='mr-3 h-6 w-6' />}
                Bekor qilish
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bekor qilish</AlertDialogTitle>
                <AlertDialogDescription>
                  Barcha aktiv alertlar hal qilinadi va favqulodda rejim o'chiriladi. Tasdiqlaysizmi?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Ortga</AlertDialogCancel>
                <AlertDialogAction onClick={() => cancel.mutate()}>
                  Tasdiqlash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Alerts List */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-yellow-500' />
              Alert tarixi
              {unresolvedCount > 0 && (
                <Badge variant='destructive'>{unresolvedCount} aktiv</Badge>
              )}
            </CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ['emergency-alerts'],
                })
              }
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className='py-8 text-center text-muted-foreground'>
                Yuklanmoqda...
              </p>
            ) : isError ? (
              <div className='flex flex-col items-center gap-2 py-8 text-center'>
                <AlertTriangle className='h-5 w-5 text-destructive' />
                <p className='text-sm text-destructive'>Alertlarni yuklashda xatolik yuz berdi</p>
              </div>
            ) : !alerts?.results.length ? (
              <p className='py-8 text-center text-muted-foreground'>
                Alertlar topilmadi
              </p>
            ) : (
              <div className='space-y-3'>
                {alerts.results.map((alert) => {
                  const config = alertTypeLabels[alert.alert_type] ?? {
                    label: alert.alert_type,
                    color: 'text-gray-500',
                  }
                  return (
                    <div
                      key={alert.id}
                      className='flex items-center justify-between rounded-md border p-3'
                    >
                      <div className='flex items-center gap-3'>
                        <AlertTriangle
                          className={`h-5 w-5 ${config.color}`}
                        />
                        <div>
                          <p className='text-sm font-medium'>
                            {config.label}
                            {alert.device_id && (
                              <span className='ml-2 text-muted-foreground'>
                                — {alert.device_id}
                              </span>
                            )}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {formatDistanceToNow(new Date(alert.created_at), {
                              addSuffix: true,
                              locale: uz,
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={alert.resolved ? 'secondary' : 'destructive'}
                      >
                        {alert.resolved ? 'Hal qilingan' : 'Aktiv'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-4 flex items-center justify-center gap-2'>
                <Button variant='outline' size='sm' disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <span className='text-sm text-muted-foreground'>
                  {page} / {totalPages}
                </span>
                <Button variant='outline' size='sm' disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
