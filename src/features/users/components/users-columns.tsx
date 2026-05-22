import { type ColumnDef } from '@tanstack/react-table'
import { Building2, CheckCircle, Cpu, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { roles, statusStyles } from '../data/data'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3'>{row.getValue('email')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ism' />
    ),
    cell: ({ row }) => {
      const { first_name, last_name } = row.original
      const fullName = `${first_name} ${last_name}`.trim() || '-'
      return <LongText className='max-w-36'>{fullName}</LongText>
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'organization_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tashkilot' />
    ),
    cell: ({ row }) => {
      const org = row.getValue('organization_name') as string
      return (
        <div className='flex items-center gap-2'>
          <Building2 className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>{org || '-'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'devices_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Qurilmalar' />
    ),
    cell: ({ row }) => {
      const count = row.getValue('devices_count') as number
      return (
        <div className='flex items-center gap-2'>
          <Cpu className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>{count ?? 0}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Holat' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean
      const status = isActive ? 'active' : 'inactive'
      const badgeColor = statusStyles.get(status)
      return (
        <Badge variant='outline' className={cn('capitalize', badgeColor)}>
          {isActive ? 'Faol' : 'Nofaol'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const isActive = row.getValue(id) as boolean
      return value.includes(isActive ? 'active' : 'inactive')
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'is_verified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tasdiqlangan' />
    ),
    cell: ({ row }) => {
      const isVerified = row.getValue('is_verified') as boolean
      return (
        <div className='flex items-center gap-1'>
          {isVerified ? (
            <CheckCircle className='h-4 w-4 text-green-600' />
          ) : (
            <XCircle className='h-4 w-4 text-amber-500' />
          )}
          <span className='text-sm'>{isVerified ? 'Ha' : "Yo'q"}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rol' />
    ),
    cell: ({ row }) => {
      const { role } = row.original
      const userType = roles.find(({ value }) => value === role)

      if (!userType) {
        return <span className='text-sm'>{role}</span>
      }

      return (
        <div className='flex items-center gap-x-2'>
          {userType.icon && (
            <userType.icon size={16} className='text-muted-foreground' />
          )}
          <span className='text-sm'>{userType.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
