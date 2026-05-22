import { useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, Eye, EyeOff, Key, Server, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useCreateDevice, useDeviceCredentials } from '@/features/devices/hooks'
import type { Device } from '@/features/devices/types'

const deviceSchema = z.object({
  device_id: z
    .string()
    .min(1, 'Qurilma ID kiritilishi shart')
    .max(64, 'Qurilma ID 64 belgidan oshmasligi kerak')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Faqat harflar, raqamlar, tire va pastki chiziq'
    ),
  school_name: z
    .string()
    .min(1, 'Maktab nomi kiritilishi shart')
    .max(255, 'Maktab nomi 255 belgidan oshmasligi kerak'),
  address: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'decommissioned']),
})

type DeviceFormValues = z.infer<typeof deviceSchema>

interface DeviceCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeviceCreateDialog({
  open,
  onOpenChange,
}: DeviceCreateDialogProps) {
  const createMutation = useCreateDevice()
  const [createdDevice, setCreatedDevice] = useState<Device | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Fetch credentials when device is created
  const { data: credentials } = useDeviceCredentials(createdDevice?.id || '')

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      device_id: '',
      school_name: '',
      address: '',
      description: '',
      status: 'active',
    },
  })

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const onSubmit = (data: DeviceFormValues) => {
    createMutation.mutate(data, {
      onSuccess: (device) => {
        setCreatedDevice(device)
      },
    })
  }

  const handleClose = () => {
    form.reset()
    setCreatedDevice(null)
    setShowPassword(false)
    onOpenChange(false)
  }

  // Show credentials after device creation
  if (createdDevice && credentials) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-green-600'>
              <Check className='h-5 w-5' />
              Qurilma muvaffaqiyatli yaratildi!
            </DialogTitle>
            <DialogDescription>
              Quyidagi MQTT credentials'larni IoT qurilmangizga kiriting.
              <span className='mt-1 block font-medium text-yellow-600'>
                ⚠️ Parolni xavfsiz joyga saqlang - keyinchalik ko'rsatilmaydi!
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {/* MQTT Broker Info */}
            <div className='rounded-lg border bg-muted/30 p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <Server className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>MQTT Broker</span>
                {credentials.mqtt_use_tls && (
                  <Badge variant='secondary' className='ml-auto'>
                    <Shield className='mr-1 h-3 w-3' />
                    TLS
                  </Badge>
                )}
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Broker</p>
                  <div className='flex items-center gap-2'>
                    <code className='rounded bg-background px-2 py-1 font-mono text-sm'>
                      {credentials.mqtt_broker}
                    </code>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() =>
                        copyToClipboard(credentials.mqtt_broker, 'broker')
                      }
                    >
                      {copiedField === 'broker' ? (
                        <Check className='h-3 w-3 text-green-500' />
                      ) : (
                        <Copy className='h-3 w-3' />
                      )}
                    </Button>
                  </div>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Port</p>
                  <div className='flex items-center gap-2'>
                    <code className='rounded bg-background px-2 py-1 font-mono text-sm'>
                      {credentials.mqtt_port}
                    </code>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() =>
                        copyToClipboard(String(credentials.mqtt_port), 'port')
                      }
                    >
                      {copiedField === 'port' ? (
                        <Check className='h-3 w-3 text-green-500' />
                      ) : (
                        <Copy className='h-3 w-3' />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Authentication */}
            <div className='rounded-lg border bg-muted/30 p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <Key className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Authentication</span>
              </div>
              <div className='space-y-3'>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Username</p>
                  <div className='flex items-center gap-2'>
                    <code className='rounded bg-background px-2 py-1 font-mono text-sm'>
                      {credentials.mqtt_username}
                    </code>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() =>
                        copyToClipboard(credentials.mqtt_username, 'username')
                      }
                    >
                      {copiedField === 'username' ? (
                        <Check className='h-3 w-3 text-green-500' />
                      ) : (
                        <Copy className='h-3 w-3' />
                      )}
                    </Button>
                  </div>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Password</p>
                  <div className='flex items-center gap-2'>
                    <code className='rounded bg-background px-2 py-1 font-mono text-sm'>
                      {showPassword
                        ? credentials.mqtt_password
                        : '••••••••••••••••'}
                    </code>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='h-3 w-3' />
                      ) : (
                        <Eye className='h-3 w-3' />
                      )}
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() =>
                        copyToClipboard(credentials.mqtt_password, 'password')
                      }
                    >
                      {copiedField === 'password' ? (
                        <Check className='h-3 w-3 text-green-500' />
                      ) : (
                        <Copy className='h-3 w-3' />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* MQTT Topics */}
            <div className='rounded-lg border bg-muted/30 p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <span className='text-sm font-medium'>MQTT Topics</span>
              </div>
              <div className='space-y-2'>
                {Object.entries(credentials.topics).map(([key, value]) => (
                  <div
                    key={key}
                    className='flex items-center justify-between rounded bg-background px-3 py-2'
                  >
                    <div className='space-y-0.5'>
                      <p className='text-xs text-muted-foreground capitalize'>
                        {key}
                      </p>
                      <code className='font-mono text-sm'>{value}</code>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() => copyToClipboard(value, key)}
                    >
                      {copiedField === key ? (
                        <Check className='h-3 w-3 text-green-500' />
                      ) : (
                        <Copy className='h-3 w-3' />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy all button */}
            <Button
              variant='outline'
              className='w-full'
              onClick={() => {
                const allCredentials = `MQTT_BROKER=${credentials.mqtt_broker}
MQTT_PORT=${credentials.mqtt_port}
MQTT_USERNAME=${credentials.mqtt_username}
MQTT_PASSWORD=${credentials.mqtt_password}
MQTT_USE_TLS=${credentials.mqtt_use_tls}
MQTT_TOPIC_COMMAND=${credentials.topics.command}
MQTT_TOPIC_DATA=${credentials.topics.data}
MQTT_TOPIC_STATUS=${credentials.topics.status}`
                copyToClipboard(allCredentials, 'all')
              }}
            >
              {copiedField === 'all' ? (
                <>
                  <Check className='mr-2 h-4 w-4 text-green-500' />
                  Nusxalandi!
                </>
              ) : (
                <>
                  <Copy className='mr-2 h-4 w-4' />
                  Barchasini nusxalash (.env format)
                </>
              )}
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Tayyor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Yangi qurilma qo'shish</DialogTitle>
          <DialogDescription>
            ESP8266 qurilmasini tizimga ro'yxatdan o'tkazing
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='device_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qurilma ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='esp8266_001'
                      {...field}
                      className='font-mono'
                    />
                  </FormControl>
                  <FormDescription>
                    MAC manzil yoki noyob identifikator
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='school_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maktab nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="1-son umumta'lim maktabi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manzil</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Toshkent sh., Chilonzor tumani'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Izoh</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Qurilma haqida qo`shimcha ma`lumot...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Status tanlang' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='active'>Faol</SelectItem>
                      <SelectItem value='inactive'>Nofaol</SelectItem>
                      <SelectItem value='maintenance'>Texnik xizmat</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Bekor qilish
              </Button>
              <Button type='submit' disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
