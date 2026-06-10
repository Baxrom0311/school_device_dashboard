import { useState } from 'react'
import { format } from 'date-fns'
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
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCode,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Star,
  Upload,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useFirmwareList,
  useMarkFirmwareStable,
  useUploadFirmware,
} from '@/features/devices/hooks'
import { type FirmwareListItem } from '@/features/devices/types'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: false },
  { title: 'Jadvallar', href: '/schedules', isActive: false },
  { title: 'Firmware', href: '/firmware', isActive: true },
]

export function FirmwarePage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [page, setPage] = useState(1)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [markStableId, setMarkStableId] = useState<string | null>(null)

  const markStableMutation = useMarkFirmwareStable()

  const { data, isLoading, isFetching, refetch } = useFirmwareList({ page })
  const firmwareList = data?.results || []

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const columns: ColumnDef<FirmwareListItem>[] = [
    {
      accessorKey: 'version',
      header: 'Versiya',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <FileCode className='h-4 w-4 text-muted-foreground' />
          <span className='font-mono font-medium'>
            v{row.getValue('version')}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'is_stable',
      header: 'Holat',
      cell: ({ row }) => {
        const isStable = row.getValue('is_stable') as boolean
        return isStable ? (
          <Badge className='bg-green-100 text-green-700'>
            <Star className='mr-1 h-3 w-3' />
            Stable
          </Badge>
        ) : (
          <Badge variant='secondary'>Beta</Badge>
        )
      },
    },
    {
      accessorKey: 'file_size',
      header: 'Hajm',
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {formatFileSize(row.getValue('file_size'))}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Yuklangan',
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {format(new Date(row.getValue('created_at')), 'dd.MM.yyyy HH:mm')}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const firmware = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {!firmware.is_stable && (
                <DropdownMenuItem onClick={() => setMarkStableId(firmware.id)}>
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Stable deb belgilash
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <a href={`/api/v1/firmware/${firmware.id}/download/`} download>
                  <Download className='mr-2 h-4 w-4' />
                  Yuklab olish
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: firmwareList,
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
              Firmware
            </h1>
            <p className='text-muted-foreground'>
              {data?.count || 0} ta versiya mavjud
            </p>
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
            <Button onClick={() => setShowUploadDialog(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Yuklash
            </Button>
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
                    Firmware versiyalar topilmadi.
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

      {/* Upload Dialog */}
      <FirmwareUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />

      {/* Mark Stable Confirm */}
      <ConfirmDialog
        open={markStableId !== null}
        onOpenChange={() => setMarkStableId(null)}
        title='Stable deb belgilash'
        desc='Bu versiyani stable (production) sifatida belgilaysizmi?'
        confirmText='Belgilash'
        handleConfirm={() => {
          if (markStableId) {
            markStableMutation.mutate(markStableId, {
              onSuccess: () => setMarkStableId(null),
            })
          }
        }}
      />
    </>
  )
}

// Upload Dialog Component
function FirmwareUploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [version, setVersion] = useState('')
  const [changelog, setChangelog] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const uploadMutation = useUploadFirmware()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !version) return

    const formData = new FormData()
    formData.append('version', version)
    formData.append('file', file)
    formData.append('changelog', changelog)

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        setVersion('')
        setChangelog('')
        setFile(null)
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Yangi firmware yuklash</DialogTitle>
          <DialogDescription>
            ESP8266 uchun .bin faylni yuklang
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='version'>Versiya</Label>
              <Input
                id='version'
                placeholder='1.0.0'
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className='font-mono'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='file'>Firmware fayl (.bin)</Label>
              <Input
                id='file'
                type='file'
                accept='.bin'
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='changelog'>O'zgarishlar</Label>
              <Textarea
                id='changelog'
                placeholder='Bu versiyada nima yangi...'
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Bekor qilish
            </Button>
            <Button
              type='submit'
              disabled={!file || !version || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  Yuklash
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
