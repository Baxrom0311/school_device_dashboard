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
import { Switch } from '@/components/ui/switch'
import {
  deviceKeys,
  useCreateSchedule,
  useUpdateSchedule,
} from '@/features/devices/hooks'
import { type DeviceDetail, type ScheduleNested } from '@/features/devices/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Clock, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

const scheduleSchema = z.object({
  times: z.array(z.string().regex(timeRegex, "Noto'g'ri vaqt formati (HH:MM)")),
  is_active: z.boolean(),
  auto_sync: z.boolean(),
})

type ScheduleFormValues = z.infer<typeof scheduleSchema>

interface ScheduleEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: DeviceDetail
  schedule: ScheduleNested | null
}

export function ScheduleEditDialog({
  open,
  onOpenChange,
  device,
  schedule,
}: ScheduleEditDialogProps) {
  const [newTime, setNewTime] = useState('')
  const queryClient = useQueryClient()

  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      times: schedule?.times || [],
      is_active: schedule?.is_active ?? true,
      auto_sync: false,
    },
  })

  const times = form.watch('times')

  const addTime = () => {
    if (timeRegex.test(newTime) && !times.includes(newTime)) {
      const newTimes = [...times, newTime].sort()
      form.setValue('times', newTimes)
      setNewTime('')
    }
  }

  const removeTime = (timeToRemove: string) => {
    form.setValue(
      'times',
      times.filter((t) => t !== timeToRemove)
    )
  }

  const onSubmit = (data: ScheduleFormValues) => {
    if (schedule) {
      // Update existing schedule
      updateMutation.mutate(
        {
          id: schedule.id,
          data: { times: data.times, is_active: data.is_active },
          autoSync: data.auto_sync,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: deviceKeys.detail(device.id),
            })
            onOpenChange(false)
          },
        }
      )
    } else {
      // Create new schedule
      createMutation.mutate(
        {
          device: device.id,
          times: data.times,
          is_active: data.is_active,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: deviceKeys.detail(device.id),
            })
            onOpenChange(false)
          },
        }
      )
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Standard school bell times
  const standardTimes = [
    '08:00',
    '08:45',
    '08:50',
    '09:35',
    '09:40',
    '10:25',
    '10:40',
    '11:25',
    '11:30',
    '12:15',
    '12:20',
    '13:05',
    '13:10',
    '13:55',
  ]

  const applyStandardTimes = () => {
    form.setValue('times', standardTimes)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {schedule ? 'Jadvalni tahrirlash' : 'Yangi jadval yaratish'}
          </DialogTitle>
          <DialogDescription>
            {device.school_name} uchun qo'ng'iroq vaqtlarini belgilang
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Add time input */}
            <div className='flex gap-2'>
              <Input
                type='time'
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className='flex-1'
              />
              <Button type='button' onClick={addTime} disabled={!newTime}>
                <Plus className='mr-2 h-4 w-4' />
                Qo'shish
              </Button>
            </div>

            {/* Quick actions */}
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={applyStandardTimes}
              >
                Standart jadval
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => form.setValue('times', [])}
              >
                Tozalash
              </Button>
            </div>

            {/* Times list */}
            <FormField
              control={form.control}
              name='times'
              render={() => (
                <FormItem>
                  <FormLabel>Qo'ng'iroq vaqtlari ({times.length} ta)</FormLabel>
                  <div className='flex min-h-[60px] flex-wrap gap-2 rounded-md border p-3'>
                    {times.length === 0 ? (
                      <p className='text-sm text-muted-foreground'>
                        Vaqt qo'shilmagan
                      </p>
                    ) : (
                      times.map((time) => (
                        <Badge
                          key={time}
                          variant='secondary'
                          className='flex items-center gap-1 px-2 py-1'
                        >
                          <Clock className='h-3 w-3' />
                          {time}
                          <button
                            type='button'
                            onClick={() => removeTime(time)}
                            className='ml-1 hover:text-destructive'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is active */}
            <FormField
              control={form.control}
              name='is_active'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <FormLabel>Jadval faol</FormLabel>
                    <FormDescription>
                      Nofaol jadvaldagi vaqtlar ishlamaydi
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

            {/* Auto sync */}
            {schedule && (
              <FormField
                control={form.control}
                name='auto_sync'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>Avtomatik sinxronlash</FormLabel>
                      <FormDescription>
                        Saqlanganda qurilmaga yuborish
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
            )}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Bekor qilish
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
