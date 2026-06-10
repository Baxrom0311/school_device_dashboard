import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBulkRing } from '@/features/devices/hooks'
import { type DeviceListItem } from '@/features/devices/types'
import { type Table } from '@tanstack/react-table'
import { Bell, RefreshCw, Search, X } from 'lucide-react'

interface DataTableToolbarProps {
  table: Table<DeviceListItem>
  searchValue: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  registrationFilter: string
  onRegistrationChange: (value: string) => void
  wifiModeFilter: string
  onWifiModeChange: (value: string) => void
  onRefresh: () => void
  isRefreshing: boolean
}

export function DevicesToolbar({
  table,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
  registrationFilter,
  onRegistrationChange,
  wifiModeFilter,
  onWifiModeChange,
  onRefresh,
  isRefreshing,
}: DataTableToolbarProps) {
  const bulkRingMutation = useBulkRing()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map((row) => row.original.id)
  const hasSelection = selectedIds.length > 0

  const handleBulkRing = () => {
    if (selectedIds.length > 0) {
      bulkRingMutation.mutate(selectedIds)
    }
  }

  const clearFilters = () => {
    onSearchChange('')
    onStatusChange('all')
    onRegistrationChange('all')
    onWifiModeChange('all')
    table.resetColumnFilters()
  }

  const hasFilters = searchValue || statusFilter !== 'all' || registrationFilter !== 'all' || wifiModeFilter !== 'all'

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        {/* Search */}
        <div className='relative flex-1 min-w-[200px] max-w-sm'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Qidirish (ID, maktab nomi)...'
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-8'
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Barcha status</SelectItem>
            <SelectItem value='active'>Faol</SelectItem>
            <SelectItem value='inactive'>Nofaol</SelectItem>
            <SelectItem value='maintenance'>Texnik xizmat</SelectItem>
            <SelectItem value='decommissioned'>Ishdan chiqarilgan</SelectItem>
          </SelectContent>
        </Select>

        {/* Registration Filter */}
        <Select value={registrationFilter} onValueChange={onRegistrationChange}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder="Ro'yxatdan o'tish" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Barchasi</SelectItem>
            <SelectItem value='registered'>Ro'yxatdan o'tgan</SelectItem>
            <SelectItem value='pending'>Kutilmoqda</SelectItem>
            <SelectItem value='unregistered'>Ro'yxatdan o'tmagan</SelectItem>
          </SelectContent>
        </Select>

        {/* WiFi Mode Filter */}
        <Select value={wifiModeFilter} onValueChange={onWifiModeChange}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='WiFi holati' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Barcha WiFi</SelectItem>
            <SelectItem value='sta'>Ulangan</SelectItem>
            <SelectItem value='ap'>AP Mode</SelectItem>
            <SelectItem value='disconnected'>Uzilgan</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasFilters && (
          <Button variant='ghost' onClick={clearFilters} className='h-9 px-2'>
            <X className='mr-2 h-4 w-4' />
            Tozalash
          </Button>
        )}

        {/* Refresh */}
        <Button
          variant='outline'
          size='icon'
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Bulk actions */}
      {hasSelection && (
        <div className='flex items-center gap-2 rounded-lg bg-muted p-2'>
          <span className='text-sm text-muted-foreground'>
            {selectedIds.length} ta tanlangan
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={handleBulkRing}
            disabled={bulkRingMutation.isPending}
          >
            <Bell className='mr-2 h-4 w-4' />
            Qo'ng'iroq
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => table.resetRowSelection()}
          >
            <X className='mr-2 h-4 w-4' />
            Bekor qilish
          </Button>
        </div>
      )}
    </div>
  )
}
