import { useState } from 'react'
import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  MoreHorizontal,
  Package,
  Pause,
  Play,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  useOtaBatches,
  useStartOtaBatch,
} from '@/features/devices/hooks'
import { OTABatch, OTABatchStatus } from '@/features/devices/types'
import { OtaCreateDialog } from './ota-create-dialog'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: false },
  { title: 'Jadvallar', href: '/schedules', isActive: false },
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

export function OtaBatchesPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [cancelBatchId, setCancelBatchId] = useState<string | null>(null)
  const [startBatchId, setStartBatchId] = useState<string | null>(null)

  const cancelMutation = useCancelOtaBatch()
  const startMutation = useStartOtaBatch()

  const { data, isLoading, isFetching, refetch } = useOtaBatches({
    page,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })
  const batches = data?.results || []

  const getProgress = (batch: OTABatch) => {
    if (batch.total_devices === 0) return 0
    return Math.round(
      ((batch.success_count + batch.failed_count) / batch.total_devices) * 100
    )
  }

  const columns: ColumnDef<OTABatch>[] = [
    {
      accessorKey: 'name',
      header: 'Nomi',
      cell: ({ row }) => (
        <Link
          to='/ota-batches/$batchId'
          params={{ batchId: row.original.id }}
          className='font-medium hover:underline'
        >
          {row.getValue('name')}
        </Link>
      ),
    },
    {
      accessorKey: 'firmware_version',
      header: 'Firmware',
      cell: ({ row }) => (
        <Badge variant='outline' className='font-mono'>
          v{row.getValue('firmware_version')}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Holat',
      cell: ({ row }) => {
        const status = row.getValue('status') as OTABatchStatus
        const config = statusConfig[status]
        const Icon = config.icon
        return (
          <Badge className={config.color}>
            <Icon
              className={`mr-1 h-3 w-3 ${status === 'in_progress' ? 'animate-spin' : ''}`}
            />
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const batch = row.original
        const progress = getProgress(batch)
        return (
          <div className='flex items-center gap-2'>
            <Progress value={progress} className='h-2 w-24' />
            <span className='text-xs text-muted-foreground'>
              {batch.success_count}/{batch.total_devices}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'total_devices',
      header: 'Qurilmalar',
      cell: ({ row }) => {
        const batch = row.original
        return (
          <div className='text-sm'>
            <span className='text-green-600'>{batch.success_count}✓</span>
            {batch.failed_count > 0 && (
              <span className='ml-2 text-red-600'>{batch.failed_count}✗</span>
            )}
            <span className='ml-2 text-muted-foreground'>
              /{batch.total_devices}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Yaratilgan',
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {format(new Date(row.getValue('created_at')), 'dd.MM.yyyy HH:mm')}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const batch = row.original
        const canStart = batch.status === 'pending'
        const canCancel =
          batch.status === 'pending' || batch.status === 'in_progress'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <Link to='/ota-batches/$batchId' params={{ batchId: batch.id }}>
                  <Package className='mr-2 h-4 w-4' />
                  Batafsil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canStart && (
                <DropdownMenuItem onClick={() => setStartBatchId(batch.id)}>
                  <Play className='mr-2 h-4 w-4' />
                  Boshlash
                </DropdownMenuItem>
              )}
              {canCancel && (
                <DropdownMenuItem
                  onClick={() => setCancelBatchId(batch.id)}
                  className='text-red-600'
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  Bekor qilish
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: batches,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    manualPagination: true,
  })

  const totalPages = data ? Math.ceil(data.count / 10) : 0

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
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
              <Download className='h-6 w-6' />
              OTA Yangilanishlar
            </h1>
            <p className='text-muted-foreground'>
              Qurilmalarni masofadan yangilash - {data?.count || 0} ta batch
            </p>
          </div>
          <div className='flex gap-2'>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Holat' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Barchasi</SelectItem>
                <SelectItem value='pending'>Kutilmoqda</SelectItem>
                <SelectItem value='in_progress'>Jarayonda</SelectItem>
                <SelectItem value='completed'>Yakunlandi</SelectItem>
                <SelectItem value='failed'>Xatolik</SelectItem>
                <SelectItem value='cancelled'>Bekor qilindi</SelectItem>
              </SelectContent>
            </Select>
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
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Yangi OTA
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='mb-6 grid gap-4 md:grid-cols-4'>
          <div className='rounded-lg border p-4'>
            <div className='flex items-center gap-2'>
              <Clock className='h-5 w-5 text-yellow-500' />
              <span className='text-sm text-muted-foreground'>Kutilmoqda</span>
            </div>
            <p className='mt-1 text-2xl font-bold'>
              {batches.filter((b) => b.status === 'pending').length}
            </p>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='flex items-center gap-2'>
              <Loader2 className='h-5 w-5 text-blue-500' />
              <span className='text-sm text-muted-foreground'>Jarayonda</span>
            </div>
            <p className='mt-1 text-2xl font-bold'>
              {batches.filter((b) => b.status === 'in_progress').length}
            </p>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <span className='text-sm text-muted-foreground'>Yakunlandi</span>
            </div>
            <p className='mt-1 text-2xl font-bold'>
              {batches.filter((b) => b.status === 'completed').length}
            </p>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='flex items-center gap-2'>
              <XCircle className='h-5 w-5 text-red-500' />
              <span className='text-sm text-muted-foreground'>Xatolik</span>
            </div>
            <p className='mt-1 text-2xl font-bold'>
              {batches.filter((b) => b.status === 'failed').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className='h-6 w-full' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    OTA batch topilmadi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-end space-x-2 py-4'>
          <span className='text-sm text-muted-foreground'>
            Sahifa {page} / {totalPages || 1}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data?.previous}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.next}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </Main>

      {/* Create Dialog */}
      <OtaCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Start Confirm */}
      <ConfirmDialog
        open={startBatchId !== null}
        onOpenChange={() => setStartBatchId(null)}
        title='OTA yangilanishni boshlash'
        desc='Bu batch dagi barcha qurilmalarga yangilanish yuboriladi. Davom etasizmi?'
        confirmText='Boshlash'
        handleConfirm={() => {
          if (startBatchId) {
            startMutation.mutate(startBatchId, {
              onSuccess: () => setStartBatchId(null),
            })
          }
        }}
      />

      {/* Cancel Confirm */}
      <ConfirmDialog
        open={cancelBatchId !== null}
        onOpenChange={() => setCancelBatchId(null)}
        title='OTA yangilanishni bekor qilish'
        desc="Bu batch bekor qilinadi va qolgan qurilmalar yangilanmaydi. Bu amalni ortga qaytarib bo'lmaydi!"
        confirmText='Bekor qilish'
        destructive
        handleConfirm={() => {
          if (cancelBatchId) {
            cancelMutation.mutate(cancelBatchId, {
              onSuccess: () => setCancelBatchId(null),
            })
          }
        }}
      />
    </>
  )
}
