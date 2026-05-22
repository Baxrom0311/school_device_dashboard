'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usersApi } from '../api/users-api'
import { type User } from '../data/schema'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => usersApi.deleteUser(currentRow.id),
    onSuccess: () => {
      toast.success("Foydalanuvchi muvaffaqiyatli o'chirildi")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Foydalanuvchini o'chirishda xatolik yuz berdi"
      )
    },
  })

  const handleDelete = () => {
    if (value.trim() !== currentRow.email) return
    deleteMutation.mutate()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.email || deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Foydalanuvchini o'chirish
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Haqiqatan ham <span className='font-bold'>{currentRow.email}</span>{' '}
            ni o'chirmoqchimisiz?
            <br />
            Bu amal{' '}
            <span className='font-bold'>
              {currentRow.role.toUpperCase()}
            </span>{' '}
            roliga ega foydalanuvchini tizimdan butunlay o'chiradi. Buni
            qaytarib bo'lmaydi.
          </p>

          <Label className='my-2'>
            Email:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="O'chirishni tasdiqlash uchun email kiriting."
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Ogohlantirish!</AlertTitle>
            <AlertDescription>
              Iltimos, ehtiyot bo'ling, bu amalni qaytarib bo'lmaydi.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
      destructive
    />
  )
}
