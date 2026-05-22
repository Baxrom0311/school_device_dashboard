import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import {
  Bell,
  Clock,
  Eye,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  useDeleteDevice,
  useDeviceNtpSync,
  useDeviceRestart,
  useDeviceRing,
} from '@/features/devices/hooks'
import { DeviceListItem } from '@/features/devices/types'

interface DataTableRowActionsProps {
  row: Row<DeviceListItem>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const device = row.original
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const ringMutation = useDeviceRing()
  const restartMutation = useDeviceRestart()
  const ntpSyncMutation = useDeviceNtpSync()
  const deleteMutation = useDeleteDevice()

  const handleRing = () => {
    ringMutation.mutate({ id: device.id, duration: 5 })
  }

  const handleRestart = () => {
    restartMutation.mutate(device.id)
  }

  const handleNtpSync = () => {
    ntpSyncMutation.mutate(device.id)
  }

  const handleDelete = () => {
    deleteMutation.mutate(device.id, {
      onSuccess: () => setShowDeleteDialog(false),
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Menyu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem asChild>
            <Link
              to='/devices/$deviceId'
              params={{ deviceId: String(device.id) }}
            >
              <Eye className='mr-2 h-4 w-4' />
              Ko'rish
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleRing}
            disabled={ringMutation.isPending}
          >
            <Bell className='mr-2 h-4 w-4' />
            Qo'ng'iroq
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleRestart}
            disabled={restartMutation.isPending}
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            Qayta ishga tushirish
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleNtpSync}
            disabled={ntpSyncMutation.isPending}
          >
            <Clock className='mr-2 h-4 w-4' />
            NTP sinxronizatsiya
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className='text-destructive focus:text-destructive'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            O'chirish
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Qurilmani o'chirish"
        desc={`"${device.school_name}" (${device.device_id}) qurilmasini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        confirmText="O'chirish"
        destructive
        handleConfirm={handleDelete}
      />
    </>
  )
}
