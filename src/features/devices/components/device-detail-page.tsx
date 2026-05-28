import { format, formatDistanceToNow } from 'date-fns'
import { Link, useParams } from '@tanstack/react-router'
import { uz } from 'date-fns/locale'
import {
  Activity,
  ArrowLeft,
  Battery,
  BatteryWarning,
  Bell,
  CheckCircle,
  Clock,
  Cpu,
  Download,
  HardDrive,
  Info,
  MapPin,
  RefreshCw,
  RotateCcw,
  Signal,
  UserCheck,
  UserX,
  Wifi,
  XCircle,
} from 'lucide-react'
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
import { ApProvisioningCard } from './ap-provisioning-card'
import { CredentialsCard } from './credentials-card'
import { BellLogTable } from './bell-log-table'
import { RtcDiagnosticsCard } from './rtc-diagnostics-card'
import { ScheduleCard } from './schedule-card'
import { WifiModeBadge } from './wifi-mode-badge'

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
                <WifiModeBadge mode={device.wifi_mode} />
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={restartMutation.isPending}
                >
                  <RotateCcw className='mr-2 h-4 w-4' />
                  Qayta ishga tushirish
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Qayta ishga tushirish</AlertDialogTitle>
                  <AlertDialogDescription>
                    Qurilma qayta ishga tushiriladi. Tasdiqlaysizmi?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRestart}>Tasdiqlash</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size='sm'
                    disabled={otaUpdateMutation.isPending}
                  >
                    <Download className='mr-2 h-4 w-4' />
                    OTA Update
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>OTA yangilash</AlertDialogTitle>
                    <AlertDialogDescription>
                      Qurilma firmware yangilanadi. Jarayon davomida qurilma ishlamaydi. Tasdiqlaysizmi?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                    <AlertDialogAction onClick={handleOtaUpdate}>Tasdiqlash</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          {/* AP Provisioning Info */}
          {(device.wifi_mode === 'ap' || device.wifi_mode === 'ap_sta') && (
            <div className='lg:col-span-2'>
              <ApProvisioningCard wifiMode={device.wifi_mode} macAddress={device.mac_address} />
            </div>
          )}

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
                  <p className='text-sm text-muted-foreground'>RTC Batareya</p>
                  <div className='flex items-center gap-1'>
                    {device.rtc_battery_status === 'dead' ? (
                      <>
                        <BatteryWarning className='h-4 w-4 text-red-500' />
                        <Badge variant='destructive' className='text-xs'>O'lgan</Badge>
                      </>
                    ) : device.rtc_battery_status === 'low' ? (
                      <>
                        <BatteryWarning className='h-4 w-4 text-yellow-500' />
                        <Badge variant='outline' className='border-yellow-500 text-yellow-600 text-xs'>Zaiflashgan</Badge>
                      </>
                    ) : (
                      <>
                        <Battery className='h-4 w-4 text-green-500' />
                        <span className='text-sm'>Yaxshi</span>
                      </>
                    )}
                  </div>
                  {device.rtc_drift_sec != null && device.rtc_drift_sec > 30 && (
                    <p className='mt-1 text-xs text-yellow-600'>
                      Drift: {device.rtc_drift_sec}s
                    </p>
                  )}
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

        {/* Monitoring: RSSI, Uptime, Free Heap */}
        <div className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div className='flex items-center gap-3 rounded-md border p-3'>
                  <Wifi className={`h-5 w-5 ${getRssiColor(device.rssi)}`} />
                  <div>
                    <p className='text-xs text-muted-foreground'>WiFi Signal (RSSI)</p>
                    <p className='text-lg font-semibold'>
                      {device.rssi != null ? `${device.rssi} dBm` : '—'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-md border p-3'>
                  <Signal className='h-5 w-5 text-blue-500' />
                  <div>
                    <p className='text-xs text-muted-foreground'>Uptime</p>
                    <p className='text-lg font-semibold'>
                      {device.uptime_sec != null ? formatUptime(device.uptime_sec) : '—'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-md border p-3'>
                  <HardDrive className='h-5 w-5 text-purple-500' />
                  <div>
                    <p className='text-xs text-muted-foreground'>Free Heap</p>
                    <p className='text-lg font-semibold'>
                      {device.free_heap != null ? `${(device.free_heap / 1024).toFixed(1)} KB` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RTC Diagnostics */}
        <div className='mt-6'>
          <RtcDiagnosticsCard
            deviceId={device.id}
            currentDrift={device.rtc_drift_sec}
            batteryStatus={device.rtc_battery_status}
          />
        </div>

        {/* Bell Log */}
        <div className='mt-6'>
          <BellLogTable deviceId={device.device_id} />
        </div>

        {/* Credentials */}
        <div className='mt-6'>
          <CredentialsCard deviceId={device.id} />
        </div>
      </Main>
    </>
  )
}

function getRssiColor(rssi: number | null | undefined): string {
  if (rssi == null) return 'text-muted-foreground'
  if (rssi >= -50) return 'text-green-500'
  if (rssi >= -70) return 'text-yellow-500'
  return 'text-red-500'
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
