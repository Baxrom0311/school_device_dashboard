'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { SelectDropdown } from '@/components/select-dropdown'
import { usersApi } from '../api/users-api'
import { roles } from '../data/data'
import { type User } from '../data/schema'

const formSchema = z.object({
  role: z.enum(['ADMIN', 'SCHOOL_ADMIN', 'USER']),
  is_active: z.boolean(),
  is_verified: z.boolean(),
})

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          role: currentRow.role as 'ADMIN' | 'SCHOOL_ADMIN' | 'USER',
          is_active: currentRow.is_active,
          is_verified: currentRow.is_verified,
        }
      : {
          role: 'USER',
          is_active: true,
          is_verified: false,
        },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UserForm) => {
      if (!currentRow) throw new Error('User not found')
      return usersApi.updateUser(currentRow.id, data)
    },
    onSuccess: () => {
      toast.success('Foydalanuvchi muvaffaqiyatli yangilandi')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      form.reset()
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Foydalanuvchini yangilashda xatolik yuz berdi')
    },
  })

  const onSubmit = (values: UserForm) => {
    updateMutation.mutate(values)
  }

  if (!currentRow) {
    return null
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Foydalanuvchini tahrirlash</DialogTitle>
          <DialogDescription>
            <span className='font-medium'>{currentRow.email}</span>{' '}
            foydalanuvchining rol va holatini o'zgartiring.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='user-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Rol tanlang'
                    items={roles.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='is_active'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <FormLabel>Faol holat</FormLabel>
                    <FormDescription>
                      Foydalanuvchi tizimga kirish imkoniyati
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='is_verified'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <FormLabel>Tasdiqlangan</FormLabel>
                    <FormDescription>
                      Email manzili tasdiqlangan
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            type='submit'
            form='user-form'
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
