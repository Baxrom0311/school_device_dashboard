import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Check, Cpu, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { extractApiErrorMessage } from '@/lib/api-error'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { deviceApi } from '@/features/devices/api'
import type { DeviceClaimResponse } from '@/features/devices/types'

const claimSchema = z.object({
  device_id: z
    .string()
    .min(1, 'MAC address kiritilishi shart')
    .regex(
      /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$/,
      "MAC address formati noto'g'ri (masalan: AA:BB:CC:DD:EE:FF)"
    ),
  device_name: z.string().optional(),
})

type ClaimFormData = z.infer<typeof claimSchema>

interface DeviceClaimProps {
  basePath?: 'admin' | 'member'
}

export function DeviceClaim({ basePath = 'admin' }: DeviceClaimProps) {
  const navigate = useNavigate()
  const [claimedDevice, setClaimedDevice] = useState<
    DeviceClaimResponse['device'] | null
  >(null)

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      device_id: '',
      device_name: '',
    },
  })

  const claimMutation = useMutation({
    mutationFn: deviceApi.claim,
    onSuccess: (data) => {
      setClaimedDevice(data.device)
      toast.success("Qurilma muvaffaqiyatli qo'shildi!", {
        description: data.message,
      })
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(
        error,
        "Qurilmani qo'shishda xatolik yuz berdi",
        'device_id'
      )
      toast.error('Xatolik', { description: message })
    },
  })

  function onSubmit(data: ClaimFormData) {
    // Normalize MAC address
    const normalizedMac = data.device_id.replace(/[:-]/g, '').toUpperCase()
    claimMutation.mutate({
      device_id: normalizedMac,
      device_name: data.device_name,
    })
  }

  function handleGoToDashboard() {
    navigate({ to: '/' })
  }

  function handleGoToDevice() {
    if (claimedDevice) {
      navigate({
        to: '/devices/$deviceId',
        params: { deviceId: claimedDevice.id },
      })
    }
  }

  if (claimedDevice) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
              <Check className='h-8 w-8 text-green-600 dark:text-green-400' />
            </div>
            <CardTitle className='text-xl'>
              Qurilma muvaffaqiyatli qo'shildi!
            </CardTitle>
            <CardDescription>
              {basePath === 'member'
                ? 'Endi qurilmangizni boshqarishingiz mumkin.'
                : 'Endi qurilmangiz uchun jadval yaratishingiz mumkin.'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-lg border p-4'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>MAC Address:</span>
                  <span className='font-mono'>{claimedDevice.device_id}</span>
                </div>
                {claimedDevice.school_name && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Nomi:</span>
                    <span>{claimedDevice.school_name}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Holati:</span>
                  <span className='capitalize'>{claimedDevice.status}</span>
                </div>
              </div>
            </div>

            {basePath === 'member' ? (
              <Button className='w-full' onClick={handleGoToDashboard}>
                Boshqaruvga o'tish
              </Button>
            ) : (
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={handleGoToDashboard}
                >
                  Bosh sahifa
                </Button>
                <Button className='flex-1' onClick={handleGoToDevice}>
                  Qurilmaga o'tish
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
            <Cpu className='h-8 w-8 text-primary' />
          </div>
          <CardTitle className='text-xl'>Qurilmani qo'shish</CardTitle>
          <CardDescription>
            Qurilmangiz ustidagi stikerdan MAC addressni kiriting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='device_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MAC Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='AA:BB:CC:DD:EE:FF'
                        className='font-mono'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Qurilma ustidagi stikerdan MAC addressni kiriting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='device_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qurilma nomi (ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masalan: Asosiy qo'ng'iroq"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Qurilmani tanib olish uchun nom bering
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full'
                disabled={claimMutation.isPending}
              >
                {claimMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Tekshirilmoqda...
                  </>
                ) : (
                  "Qurilmani qo'shish"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
