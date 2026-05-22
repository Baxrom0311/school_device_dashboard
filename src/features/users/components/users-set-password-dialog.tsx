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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { usersApi } from '../api/users-api'
import { type User } from '../data/schema'

const formSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak.")
      .regex(/[a-z]/, "Parolda kamida bitta kichik harf bo'lishi kerak.")
      .regex(/\d/, "Parolda kamida bitta raqam bo'lishi kerak."),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Parollar mos kelmaydi.',
    path: ['confirm_password'],
  })

type PasswordForm = z.infer<typeof formSchema>

type UserSetPasswordDialogProps = {
  currentRow: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersSetPasswordDialog({
  currentRow,
  open,
  onOpenChange,
}: UserSetPasswordDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<PasswordForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  })

  const setPasswordMutation = useMutation({
    mutationFn: (data: { new_password: string; confirm_password: string }) =>
      usersApi.setUserPassword(currentRow.id, data),
    onSuccess: () => {
      toast.success("Parol muvaffaqiyatli o'zgartirildi")
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      form.reset()
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Parolni o'zgartirishda xatolik yuz berdi")
    },
  })

  const onSubmit = (values: PasswordForm) => {
    setPasswordMutation.mutate({
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    })
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
          <DialogTitle>Parolni o'zgartirish</DialogTitle>
          <DialogDescription>
            <span className='font-medium'>{currentRow.email}</span>{' '}
            foydalanuvchi uchun yangi parol o'rnating.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='set-password-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='new_password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yangi parol</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirm_password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parolni tasdiqlang</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
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
            form='set-password-form'
            disabled={setPasswordMutation.isPending}
          >
            {setPasswordMutation.isPending
              ? "O'zgartirilmoqda..."
              : "O'zgartirish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
