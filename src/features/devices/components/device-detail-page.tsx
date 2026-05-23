import { format, formatDistanceToNow } from 'date-fns'
import { Link, useParams } from '@tanstack/react-router'
import { uz } from 'date-fns/locale'
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Clock,
  Cpu,
  Download,
  Info,
  MapPin,
  RefreshCw,
  RotateCcw,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useDevice,
  useDeviceNtpSync,
  useDeviceOtaUpdate,
  useDeviceRestart,
  useDeviceRing,
} from '@/features/devices/hooks'
import { CredentialsCard } from './credentials-card'
import { ScheduleCard } from './schedule-card'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: true },
  { title: 'Jadvallar', href: '/schedules', isActive: false },
  { title: 'Firmware', href: '/firmware', isActive: false },
]

const statusLabels: Record<string, string> = {
  active: 'Faol',
  inactive: 'Nofaol',
  maintenance: 'Texnik xizmat',
  decommissioned: 'Ishdan chiqarilgan',
}

export function DeviceDetailPage() {
  const { deviceId } = useParams({ from: '/_authenticated/devices/$deviceId' })
  const { data: device, isLoading, refetch, isFetching } = useDevice(deviceId)

  const ringMutation = useDeviceRing()
  const restartMutation = useDeviceRestart()
  const ntpSyncMutation = useDeviceNtpSync()
  const otaUpdateMutation = useDeviceOtaUpdate()

  const handleRing = () => {
    ringMutation.mutate({ id: device!.id, duration: 5 })
  }

  const handleRestart = () => {
    restartMutation.mutate(device!.id)
  }

  const handleNtpSync = () => {
    ntpSyncMutation.mutate(device!.id)
  }

  const handleOtaUpdate = () => {
    otaUpdateMutation.mutate(device!.id)
  }

  if (isLoading) {
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
          <div className='space-y-6'>
            <Skeleton className='h-8 w-64' />
            <div className='grid gap-6 md:grid-cols-2'>
              <Skeleton className='h-48' />
              <Skeleton className='h-48' />
            </div>
          </div>
        </Main>
      </>
    )
  }

  if (!device) {
    return (
      <>
        <Header>
          <TopNav links={topNav} />
        </Header>
        <Main>
          <div className='flex flex-col items-center justify-center py-12'>
            <h2 className='text-xl font-semibold'>Qurilma topilmadi</h2>
            <Button asChild className='mt-4'>
              <Link to='/devices'>Qurilmalarga qaytish</Link>
            </Button>
          </div>
        </Main>
      </>
    )
  }

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
        {/* Header */}
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' asChild>
              <Link to='/devices'>
                <ArrowLeft className='h-4 w-4' />
              </Link>
            </Button>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl font-bold'>
                  {device.school_name || "Noma'lum maktab"}
                </h1>
                <Badge
                  variant={
                    device.registration_status === 'registered'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {device.registration_status === 'registered' ? (
                    <>
                      <UserCheck className='mr-1 h-3 w-3' /> Ro'yxatdan o'tgan
                    </>
                  ) : device.registration_status === 'pending' ? (
                    <>
                      <Clock className='mr-1 h-3 w-3' /> Kutilmoqda
                    </>
                  ) : (
                    <>
                      <UserX className='mr-1 h-3 w-3' /> Ro'yxatdan o'tmagan
                    </>
                  )}
                </Badge>
              </div>
              <p className='font-mono text-muted-foreground'>
                {device.device_id}
              </p>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
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
            <Button
              variant='outline'
              size='sm'
              onClick={handleRing}
              disabled={ringMutation.isPending}
            >
              <Bell className='mr-2 h-4 w-4' />
              Qo'ng'iroq
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRestart}
              disabled={restartMutation.isPending}
            >
              <RotateCcw className='mr-2 h-4 w-4' />
              Qayta ishga tushirish
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleNtpSync}
              disabled={ntpSyncMutation.isPending}
            >
              <Clock className='mr-2 h-4 w-4' />
              NTP Sync
            </Button>
            {device.needs_ota_update && device.target_firmware && (
              <Button
                size='sm'
                onClick={handleOtaUpdate}
                disabled={otaUpdateMutation.isPending}
              >
                <Download className='mr-2 h-4 w-4' />
                OTA Update
              </Button>
            )}
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Device Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Cpu className='h-5 w-5' />
                Qurilma ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <p className='text-sm text-muted-foreground'>Status</p>
                  <Badge variant='outline'>{statusLabels[device.status]}</Badge>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Firmware</p>
                  <Badge variant='secondary' className='font-mono'>
                    v{device.firmware_version}
                  </Badge>
                  {device.target_firmware_version &&
                    device.firmware_version !==
                      device.target_firmware_version && (
                      <span className='ml-2 text-xs text-muted-foreground'>
                        → v{device.target_firmware_version}
                      </span>
                    )}
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>RTC Sinxron</p>
                  <div className='flex items-center gap-1'>
                    {device.rtc_synced ? (
                      <CheckCircle className='h-4 w-4 text-green-500' />
                    ) : (
                      <XCircle className='h-4 w-4 text-red-500' />
                    )}
                    <span>{device.rtc_synced ? 'Ha' : "Yo'q"}</span>
                  </div>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Oxirgi faollik
                  </p>
                  <p className='text-sm'>
                    {device.last_seen
                      ? formatDistanceToNow(new Date(device.last_seen), {
                          addSuffix: true,
                          locale: uz,
                        })
                      : 'Hech qachon'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Ro'yxatdan o'tgan
                  </p>
                  <p className='text-sm'>
                    {device.registered_at
                      ? formatDistanceToNow(new Date(device.registered_at), {
                          addSuffix: true,
                          locale: uz,
                        })
                      : '-'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Location */}
              {device.address && (
                <div className='flex items-start gap-2'>
                  <MapPin className='mt-0.5 h-4 w-4 text-muted-foreground' />
                  <p className='text-sm'>{device.address}</p>
                </div>
              )}

              {/* Description */}
              {device.description && (
                <div className='flex items-start gap-2'>
                  <Info className='mt-0.5 h-4 w-4 text-muted-foreground' />
                  <p className='text-sm'>{device.description}</p>
                </div>
              )}

              <Separator />

              <div className='flex items-center justify-between text-sm text-muted-foreground'>
                <span>
                  Yaratilgan:{' '}
                  {format(new Date(device.created_at), 'dd.MM.yyyy HH:mm')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <ScheduleCard device={device} />
        </div>

        {/* Credentials */}
        <div className='mt-6'>
          <CredentialsCard deviceId={device.id} />
        </div>
      </Main>
    </>
  )
}
