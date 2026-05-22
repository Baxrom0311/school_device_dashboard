import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'

type DataTableProps = {
  data: User[]
  search: Record<string, unknown>
  navigate: NavigateFn
  totalCount?: number
  isLoading?: boolean
  error?: Error | null
}

export function UsersTable({
  data,
  search,
  navigate,
  totalCount = 0,
  isLoading = false,
  error = null,
}: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Synced with URL states (keys/defaults mirror users route search schema)
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      // email per-column text filter
      { columnId: 'email', searchKey: 'email', type: 'string' },
      { columnId: 'is_active', searchKey: 'is_active', type: 'array' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  })

  // Calculate page count for server-side pagination
  const pageCount = Math.ceil(totalCount / pagination.pageSize)

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    // Server-side pagination - TanStack Table doesn't manage total count
    manualPagination: true,
    pageCount,
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-muted-foreground'>
          Xatolik yuz berdi: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder="Email bo'yicha qidirish..."
        searchKey='email'
        filters={[
          {
            columnId: 'is_active',
            title: 'Holat',
            options: [
              { label: 'Faol', value: 'true' },
              { label: 'Nofaol', value: 'false' },
            ],
          },
          {
            columnId: 'role',
            title: 'Rol',
            options: roles.map((role) => ({ ...role })),
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
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
                  {isLoading ? (
                    <div className='flex items-center justify-center gap-2'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      <span>Yuklanmoqda...</span>
                    </div>
                  ) : (
                    'Natija topilmadi.'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}
