import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from '@tanstack/react-router'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { uz } from 'date-fns/locale'
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
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
  useDeleteSchedule,
  useSchedules,
  useSyncSchedule,
} from '@/features/devices/hooks'
import { type Schedule } from '@/features/devices/types'
import { ICalImportDialog } from './ical-import-dialog'
import { TemplateSelector } from './template-selector'
import { WeeklyScheduleView } from './weekly-schedule-view'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: false },
  { title: 'Jadvallar', href: '/schedules', isActive: true },
  { title: 'Firmware', href: '/firmware', isActive: false },
]

export function SchedulesPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchValue, setSearchValue] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [syncFilter, setSyncFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [previewScheduleId, setPreviewScheduleId] = useState<string | null>(null)

  const syncMutation = useSyncSchedule()
  const deleteMutation = useDeleteSchedule()

  // Build API params
  const apiParams = useMemo(() => {
    const params: Record<string, unknown> = { page }
    if (searchValue) params.search = searchValue
    if (activeFilter !== 'all') params.is_active = activeFilter === 'true'
    if (syncFilter !== 'all') params.sync_pending = syncFilter === 'true'
    return params
  }, [page, searchValue, activeFilter, syncFilter])

  const { data, isLoading, isFetching, refetch } = useSchedules(apiParams)
  const schedules = data?.results || []

  const columns: ColumnDef<Schedule>[] = [
    {
      accessorKey: 'device_id',
      header: 'Qurilma ID',
      cell: ({ row }) => (
        <Link
          to='/devices/$deviceId'
          params={{ deviceId: String(row.original.device) }}
          className='font-mono text-sm hover:underline'
        >
          {row.getValue('device_id')}
        </Link>
      ),
    },
    {
      accessorKey: 'device_name',
      header: 'Maktab nomi',
      cell: ({ row }) => (
        <div className='max-w-[200px] truncate'>
          {row.getValue('device_name')}
        </div>
      ),
    },
    {
      accessorKey: 'times',
      header: 'Vaqtlar',
      cell: ({ row }) => {
        const times = row.getValue('times') as string[]
        return (
          <div className='flex items-center gap-1'>
            <Clock className='h-3 w-3 text-muted-foreground' />
            <span className='text-sm'>{times.length} ta</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Holat',
      cell: ({ row }) => {
        const isActive = row.getValue('is_active') as boolean
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Faol' : 'Nofaol'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'sync_pending',
      header: 'Sinxron',
      cell: ({ row }) => {
        const syncPending = row.getValue('sync_pending') as boolean
        return syncPending ? (
          <Badge variant='outline' className='text-yellow-600'>
            <RefreshCw className='mr-1 h-3 w-3' />
            Kutilmoqda
          </Badge>
        ) : (
          <Badge variant='outline' className='text-green-600'>
            <CheckCircle className='mr-1 h-3 w-3' />
            Sinxron
          </Badge>
        )
      },
    },
    {
      accessorKey: 'synced_at',
      header: "So'nggi sinxron",
      cell: ({ row }) => {
        const syncedAt = row.getValue('synced_at') as string | null
        if (!syncedAt)
          return <span className='text-xs text-muted-foreground'>-</span>
        return (
          <span className='text-xs text-muted-foreground'>
            {formatDistanceToNow(new Date(syncedAt), {
              addSuffix: true,
              locale: uz,
            })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const schedule = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() => syncMutation.mutate(schedule.id)}
                disabled={!schedule.sync_pending || syncMutation.isPending}
              >
                <Send className='mr-2 h-4 w-4' />
                Sinxronlash
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to='/devices/$deviceId'
                  params={{ deviceId: String(schedule.device) }}
                >
                  <Pencil className='mr-2 h-4 w-4' />
                  Tahrirlash
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPreviewScheduleId(schedule.id)}
              >
                <Calendar className='mr-2 h-4 w-4' />
                Haftalik ko'rinish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteId(schedule.id)}
                className='text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: schedules,
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
        <div className='mb-4'>
          <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
            <Calendar className='h-6 w-6' />
            Jadvallar
          </h1>
          <p className='text-muted-foreground'>
            {data?.count || 0} ta jadval ro'yxatda
          </p>
        </div>

        {/* Tools: iCal Import + Templates */}
        <div className='mb-4 flex flex-wrap gap-2'>
          <ICalImportDialog onImported={() => refetch()} />
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowTemplates((v) => !v)}
          >
            <LayoutTemplate className='mr-2 h-4 w-4' />
            Shablonlar
          </Button>
        </div>

        {showTemplates && (
          <Card className='mb-4'>
            <CardHeader>
              <CardTitle className='text-sm'>Jadval shablonlari</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateSelector deviceIds={[]} onApplied={() => refetch()} />
            </CardContent>
          </Card>
        )}

        {/* Weekly Schedule Preview */}
        {previewScheduleId && (() => {
          const schedule = schedules.find((s) => s.id === previewScheduleId)
          if (!schedule) return null
	          const entries = schedule.times.map((t) => {
	            const [h, m] = t.split(':').map(Number)
	            return { hour: h, minute: m, duration: schedule.bell_duration, days: schedule.days_mask }
	          })
          return (
            <div className='mb-4'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  {schedule.device_name} — haftalik jadval
                </span>
                <Button variant='ghost' size='sm' onClick={() => setPreviewScheduleId(null)}>
                  ✕
                </Button>
              </div>
              <WeeklyScheduleView entries={entries} />
            </div>
          )
        })()}

        {/* Filters */}
        <div className='mb-4 flex flex-wrap items-center gap-2'>
          <div className='relative max-w-sm min-w-[200px] flex-1'>
            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Qidirish...'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className='pl-8'
            />
          </div>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className='w-[130px]'>
              <SelectValue placeholder='Holat' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Barchasi</SelectItem>
              <SelectItem value='true'>Faol</SelectItem>
              <SelectItem value='false'>Nofaol</SelectItem>
            </SelectContent>
          </Select>
          <Select value={syncFilter} onValueChange={setSyncFilter}>
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Sinxron' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Barchasi</SelectItem>
              <SelectItem value='true'>Kutilmoqda</SelectItem>
              <SelectItem value='false'>Sinxron</SelectItem>
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
                    Jadvallar topilmadi.
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

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Jadvalni o'chirish"
        desc="Bu jadvalni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
        confirmText="O'chirish"
        destructive
        handleConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            })
          }
        }}
      />
    </>
  )
}
