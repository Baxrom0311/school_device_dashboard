import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { authApi } from '@/features/auth/api'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z
  .object({
    token: z.string().min(1, 'Tasdiqlash kodini kiriting'),
    new_password: z.string().min(7, "Parol kamida 7 ta belgi bo'lishi kerak"),
    confirm_password: z.string().min(1, 'Parolni tasdiqlang'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Parollar mos kelmaydi',
    path: ['confirm_password'],
  })

export function ResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/reset-password' })
  const email = search.email || ''
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { token: '', new_password: '', confirm_password: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!email) {
      toast.error('Email topilmadi')
      return
    }
    setIsLoading(true)
    try {
      await authApi.resetPassword({
        email,
        token: data.token,
        new_password: data.new_password,
      })
      toast.success('Parol muvaffaqiyatli yangilandi!')
      navigate({ to: '/sign-in' })
    } catch (error: any) {
      const message =
        error?.response?.data?.detail || 'Token yaroqsiz yoki muddati tugagan'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        {email && (
          <p className='text-sm text-muted-foreground'>
            <strong>{email}</strong> manziliga tiklash kodi yuborildi.
          </p>
        )}

        <FormField
          control={form.control}
          name='token'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiklash kodi</FormLabel>
              <FormControl>
                <Input
                  placeholder='Emaildan kelgan kodni kiriting'
                  className='font-mono'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='new_password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yangi parol</FormLabel>
              <FormControl>
                <Input type='password' placeholder='••••••••' {...field} />
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
                <Input type='password' placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : null}
          Parolni yangilash
        </Button>
      </form>
    </Form>
  )
}
