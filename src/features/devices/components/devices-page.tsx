import { useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useDevices } from '@/features/devices/hooks'
import { DeviceCreateDialog } from './device-create-dialog'
import { columns } from './devices-columns'
import { DevicesToolbar } from './devices-toolbar'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: true },
  { title: 'Jadvallar', href: '/schedules', isActive: false },
  { title: 'Firmware', href: '/firmware', isActive: false },
]

export function DevicesPage() {
  // Local state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Filter state
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [registrationFilter, setRegistrationFilter] = useState('all')
  const [wifiModeFilter, setWifiModeFilter] = useState('all')
  const [page, setPage] = useState(1)

  // Build API params
  const apiParams = useMemo(() => {
    const params: Record<string, unknown> = { page }
    if (searchValue) params.search = searchValue
    if (statusFilter !== 'all') params.status = statusFilter
    if (registrationFilter !== 'all')
      params.registration_status = registrationFilter
    if (wifiModeFilter !== 'all') params.wifi_mode = wifiModeFilter
    return params
  }, [page, searchValue, statusFilter, registrationFilter, wifiModeFilter])

  // Fetch data
  const { data, isLoading, isFetching, refetch } = useDevices(apiParams)
  const devices = data?.results || []

  // Table instance
  const table = useReactTable({
    data: devices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    pageCount: data ? Math.ceil(data.count / 10) : 0,
  })

  // Pagination
  const totalPages = data ? Math.ceil(data.count / 10) : 0
  const hasNextPage = data?.next !== null
  const hasPrevPage = data?.previous !== null

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Qurilmalar</h1>
            <p className='text-muted-foreground'>
              {data?.count || 0} ta qurilma ro'yxatda
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Yangi qurilma
          </Button>
        </div>

        {/* Toolbar */}
        <div className='mb-4'>
          <DevicesToolbar
            table={table}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            registrationFilter={registrationFilter}
            onRegistrationChange={setRegistrationFilter}
            wifiModeFilter={wifiModeFilter}
            onWifiModeChange={setWifiModeFilter}
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
          />
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
                // Loading skeleton
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
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
                    Qurilmalar topilmadi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between py-4'>
          <div className='text-sm text-muted-foreground'>
            {table.getFilteredSelectedRowModel().rows.length} /{' '}
            {table.getFilteredRowModel().rows.length} qator tanlangan
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-muted-foreground'>
              Sahifa {page} / {totalPages || 1}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </Main>

      {/* Create Dialog */}
      <DeviceCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  )
}
