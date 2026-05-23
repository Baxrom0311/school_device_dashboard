import { formatDistanceToNow } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { uz } from 'date-fns/locale'
import {
  Calendar,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DeviceListItem, RegistrationStatus } from '@/features/devices/types'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<DeviceListItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value: boolean) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label='Hammasini tanlash'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label='Qatorni tanlash'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'device_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Qurilma ID' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('device_id')}</div>
    ),
  },
  {
    accessorKey: 'school_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Maktab nomi' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate font-medium'>
        {row.getValue('school_name') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'registration_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ro'yxatdan o'tish" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('registration_status') as RegistrationStatus
      const statusConfig: Record<
        RegistrationStatus,
        {
          label: string
          variant: 'default' | 'secondary' | 'destructive' | 'outline'
          icon: React.ReactNode
        }
      > = {
        registered: {
          label: "Ro'yxatdan o'tgan",
          variant: 'default',
          icon: <UserCheck className='h-3 w-3' />,
        },
        pending: {
          label: 'Kutilmoqda',
          variant: 'outline',
          icon: <Clock className='h-3 w-3' />,
        },
        unregistered: {
          label: "Ro'yxatdan o'tmagan",
          variant: 'secondary',
          icon: <UserX className='h-3 w-3' />,
        },
      }
      const config = statusConfig[status] || statusConfig.unregistered
      return (
        <Badge
          variant={config.variant}
          className='flex w-fit items-center gap-1'
        >
          {config.icon}
          {config.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusConfig: Record<
        string,
        {
          label: string
          variant: 'default' | 'secondary' | 'destructive' | 'outline'
        }
      > = {
        active: { label: 'Faol', variant: 'default' },
        inactive: { label: 'Nofaol', variant: 'secondary' },
        maintenance: { label: 'Texnik xizmat', variant: 'outline' },
        decommissioned: { label: 'Ishdan chiqarilgan', variant: 'destructive' },
      }
      const config = statusConfig[status] || {
        label: status,
        variant: 'secondary',
      }
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'firmware_version',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Firmware' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='font-mono'>
        v{row.getValue('firmware_version')}
      </Badge>
    ),
  },
  {
    accessorKey: 'rtc_synced',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='RTC' />
    ),
    cell: ({ row }) => {
      const synced = row.getValue('rtc_synced') as boolean
      return (
        <div className='flex items-center gap-1'>
          {synced ? (
            <CheckCircle className='h-4 w-4 text-green-500' />
          ) : (
            <XCircle className='h-4 w-4 text-red-500' />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'has_schedule',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Jadval' />
    ),
    cell: ({ row }) => {
      const hasSchedule = row.getValue('has_schedule') as boolean
      return (
        <div className='flex items-center gap-1'>
          {hasSchedule ? (
            <Calendar className='h-4 w-4 text-green-500' />
          ) : (
            <span className='text-xs text-muted-foreground'>Yo'q</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'last_seen',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Oxirgi faollik' />
    ),
    cell: ({ row }) => {
      const lastSeen = row.getValue('last_seen') as string | null
      if (!lastSeen) {
        return <span className='text-xs text-muted-foreground'>Hech qachon</span>
      }
      const minutesAgo = (Date.now() - new Date(lastSeen).getTime()) / 60000
      const isOnline = minutesAgo < 2
      return (
        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
          {formatDistanceToNow(new Date(lastSeen), {
            addSuffix: true,
            locale: uz,
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'registered_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ro'yxatdan o'tgan" />
    ),
    cell: ({ row }) => {
      const registeredAt = row.getValue('registered_at') as string | null
      if (!registeredAt) {
        return <span className='text-xs text-muted-foreground'>-</span>
      }
      return (
        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
          <Clock className='h-3 w-3' />
          {formatDistanceToNow(new Date(registeredAt), {
            addSuffix: true,
            locale: uz,
          })}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
