import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
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
import { authApi } from '@/features/auth/api'

const formSchema = z.object({
  token: z.string().min(1, 'Tasdiqlash kodini kiriting.'),
})

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>

export function OtpForm({ className, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/otp' })
  const email = search.email || ''
  const devToken = search.token || '' // DEV ONLY - token from URL
  const { login } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { token: '' },
  })

  const token = form.watch('token')

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      // Save tokens and user to store
      login(data.access, data.refresh, data.user)

      toast.success('Email tasdiqlandi!', {
        description: "Endi qurilmangizni qo'shishingiz mumkin.",
      })

      // Navigate to device claim page
      navigate({ to: '/devices/claim' })
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.token?.[0] ||
        'Tasdiqlash kodida xatolik'
      toast.error('Xatolik', { description: message })
    },
  })

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      toast.success('Yangi kod yuborildi!', {
        description: 'Emailingizni tekshiring.',
      })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Xatolik yuz berdi'
      toast.error('Xatolik', { description: message })
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!email) {
      toast.error('Email topilmadi', {
        description: "Iltimos, ro'yxatdan o'tishni qaytadan boshlang.",
      })
      return
    }
    verifyMutation.mutate({ email, token: data.token })
  }

  function handleResend() {
    if (!email) {
      toast.error('Email topilmadi')
      return
    }
    resendMutation.mutate({ email })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        {email && (
          <p className='mb-2 text-sm text-muted-foreground'>
            <strong>{email}</strong> manziliga tasdiqlash kodi yuborildi.
          </p>
        )}

        {/* DEV ONLY - Show token for testing */}
        {devToken && (
          <div className='mb-3 rounded-lg border border-amber-500/50 bg-amber-50 p-3 dark:bg-amber-950/30'>
            <p className='text-xs font-medium text-amber-800 dark:text-amber-200'>
              🔧 Development rejimi - Tasdiqlash kodi:
            </p>
            <button
              type='button'
              onClick={() => {
                form.setValue('token', devToken)
                toast.success("Kod qo'yildi!")
              }}
              className='mt-1 block w-full cursor-pointer text-left font-mono text-sm font-bold text-amber-900 hover:underline dark:text-amber-100'
            >
              {devToken}
              <span className='ml-2 text-xs font-normal'>(bosib qo'ying)</span>
            </button>
          </div>
        )}

        <FormField
          control={form.control}
          name='token'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tasdiqlash kodi</FormLabel>
              <FormControl>
                <Input
                  placeholder='Tasdiqlash kodini kiriting...'
                  className='font-mono'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className='mt-2'
          disabled={token.length < 1 || verifyMutation.isPending}
        >
          {verifyMutation.isPending ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
        </Button>

        <Button
          type='button'
          variant='ghost'
          className='mt-1'
          disabled={resendMutation.isPending}
          onClick={handleResend}
        >
          {resendMutation.isPending
            ? 'Yuborilmoqda...'
            : 'Kodni qayta yuborish'}
        </Button>
      </form>
    </Form>
  )
}
