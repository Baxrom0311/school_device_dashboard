import { useState } from 'react'
import { format } from 'date-fns'
import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  Package,
  Pause,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useCancelOtaBatch,
  useOtaBatch,
  useOtaBatchDevices,
  useStartOtaBatch,
} from '@/features/devices/hooks'
import { OTABatchStatus, OTADeviceStatus } from '@/features/devices/types'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: false },
  { title: 'Firmware', href: '/firmware', isActive: false },
  { title: 'OTA', href: '/ota-batches', isActive: true },
]

const statusConfig: Record<
  OTABatchStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  pending: {
    label: 'Kutilmoqda',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  in_progress: {
    label: 'Jarayonda',
    color: 'bg-blue-100 text-blue-700',
    icon: Loader2,
  },
  completed: {
    label: 'Yakunlandi',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  failed: {
    label: 'Xatolik',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  cancelled: {
    label: 'Bekor qilindi',
    color: 'bg-gray-100 text-gray-700',
    icon: Pause,
  },
}

const deviceStatusConfig: Record<
  OTADeviceStatus,
  { label: string; color: string }
> = {
  pending: { label: 'Kutilmoqda', color: 'bg-gray-100 text-gray-700' },
  notified: { label: 'Xabar yuborildi', color: 'bg-blue-100 text-blue-700' },
  downloading: { label: 'Yuklanmoqda', color: 'bg-yellow-100 text-yellow-700' },
  success: { label: 'Muvaffaqiyatli', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Xatolik', color: 'bg-red-100 text-red-700' },
  skipped: { label: "O'tkazib yuborildi", color: 'bg-gray-100 text-gray-700' },
}

export function OtaBatchDetailPage() {
  const { batchId } = useParams({
    from: '/_authenticated/ota-batches/$batchId',
  })
  const [cancelOpen, setCancelOpen] = useState(false)
  const [startOpen, setStartOpen] = useState(false)

  const { data: batch, isLoading, refetch, isFetching } = useOtaBatch(batchId)
  const { data: devicesData } = useOtaBatchDevices(batchId)
  const devices = devicesData?.results || []

  const cancelMutation = useCancelOtaBatch()
  const startMutation = useStartOtaBatch()

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
          <Skeleton className='h-8 w-48' />
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
          </div>
        </Main>
      </>
    )
  }

  if (!batch) {
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
          <div className='text-center'>
            <p className='text-muted-foreground'>Batch topilmadi</p>
            <Button asChild className='mt-4'>
              <Link to='/ota-batches'>Orqaga</Link>
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const progress =
    batch.total_devices > 0
      ? Math.round(
          ((batch.success_count + batch.failed_count) / batch.total_devices) *
            100
        )
      : 0

  const config = statusConfig[batch.status]
  const StatusIcon = config.icon

  const canStart = batch.status === 'pending'
  const canCancel = batch.status === 'pending' || batch.status === 'in_progress'

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
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' size='icon' asChild>
              <Link to='/ota-batches'>
                <ArrowLeft className='h-4 w-4' />
              </Link>
            </Button>
            <div>
              <h1 className='flex items-center gap-2 text-2xl font-bold'>
                <Package className='h-6 w-6' />
                {batch.name}
              </h1>
              <p className='text-muted-foreground'>
                Firmware v{batch.firmware_version}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
              />
            </Button>
            {canStart && (
              <Button onClick={() => setStartOpen(true)}>
                <Play className='mr-2 h-4 w-4' />
                Boshlash
              </Button>
            )}
            {canCancel && (
              <Button variant='destructive' onClick={() => setCancelOpen(true)}>
                <XCircle className='mr-2 h-4 w-4' />
                Bekor qilish
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className='mb-6 grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Holat</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className={config.color}>
                <StatusIcon
                  className={`mr-1 h-4 w-4 ${batch.status === 'in_progress' ? 'animate-spin' : ''}`}
                />
                {config.label}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Progress value={progress} className='h-2' />
                <p className='text-sm text-muted-foreground'>
                  {progress}% ({batch.success_count + batch.failed_count}/
                  {batch.total_devices})
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Muvaffaqiyatli</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-green-600'>
                {batch.success_count}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Xatolik</CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-red-600'>
                {batch.failed_count}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className='mb-6 grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Ma'lumotlar</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Yaratilgan</span>
                <span>
                  {format(new Date(batch.created_at), 'dd.MM.yyyy HH:mm')}
                </span>
              </div>
              {batch.scheduled_at && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Rejali vaqt</span>
                  <span>
                    {format(new Date(batch.scheduled_at), 'dd.MM.yyyy HH:mm')}
                  </span>
                </div>
              )}
              {batch.started_at && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Boshlangan</span>
                  <span>
                    {format(new Date(batch.started_at), 'dd.MM.yyyy HH:mm')}
                  </span>
                </div>
              )}
              {batch.completed_at && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Yakunlangan</span>
                  <span>
                    {format(new Date(batch.completed_at), 'dd.MM.yyyy HH:mm')}
                  </span>
                </div>
              )}
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Soatiga qurilma</span>
                <span>{batch.devices_per_hour}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistika</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    Muvaffaqiyatli
                  </span>
                  <span className='font-medium'>{batch.success_count}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='flex items-center gap-2'>
                    <XCircle className='h-4 w-4 text-red-500' />
                    Xatolik
                  </span>
                  <span className='font-medium'>{batch.failed_count}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-gray-500' />
                    Kutilmoqda
                  </span>
                  <span className='font-medium'>
                    {batch.total_devices -
                      batch.success_count -
                      batch.failed_count}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Devices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Qurilmalar</CardTitle>
            <CardDescription>
              Bu batch ga kiritilgan {batch.total_devices} ta qurilma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Qurilma ID</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Xabar yuborilgan</TableHead>
                  <TableHead>Yakunlangan</TableHead>
                  <TableHead>Xatolik</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.length > 0 ? (
                  devices.map((device) => {
                    const devConfig = deviceStatusConfig[device.status]
                    return (
                      <TableRow key={device.id}>
                        <TableCell>
                          <Link
                            to='/devices/$deviceId'
                            params={{ deviceId: device.device }}
                            className='font-mono text-sm hover:underline'
                          >
                            {device.device_id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={devConfig.color}>
                            {devConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {device.notified_at
                            ? format(
                                new Date(device.notified_at),
                                'dd.MM HH:mm:ss'
                              )
                            : '-'}
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {device.completed_at
                            ? format(
                                new Date(device.completed_at),
                                'dd.MM HH:mm:ss'
                              )
                            : '-'}
                        </TableCell>
                        <TableCell className='max-w-[200px] truncate text-sm text-red-600'>
                          {device.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center'>
                      Qurilmalar topilmadi
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Main>

      {/* Start Confirm */}
      <ConfirmDialog
        open={startOpen}
        onOpenChange={setStartOpen}
        title='OTA yangilanishni boshlash'
        desc='Bu batch dagi barcha qurilmalarga yangilanish yuboriladi. Davom etasizmi?'
        confirmText='Boshlash'
        handleConfirm={() => {
          startMutation.mutate(batchId, {
            onSuccess: () => setStartOpen(false),
          })
        }}
      />

      {/* Cancel Confirm */}
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title='OTA yangilanishni bekor qilish'
        desc="Bu batch bekor qilinadi va qolgan qurilmalar yangilanmaydi. Bu amalni ortga qaytarib bo'lmaydi!"
        confirmText='Bekor qilish'
        destructive
        handleConfirm={() => {
          cancelMutation.mutate(batchId, {
            onSuccess: () => setCancelOpen(false),
          })
        }}
      />
    </>
  )
}
