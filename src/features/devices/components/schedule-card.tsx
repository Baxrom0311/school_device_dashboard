import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  Clock,
  GraduationCap,
  Plus,
  RefreshCw,
  School,
  Send,
  Settings2,
  Trash2,
  Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  deviceKeys,
  useCreateSchedule,
  useSyncSchedule,
  useUpdateSchedule,
} from '@/features/devices/hooks'
import { DeviceDetail } from '@/features/devices/types'

interface ScheduleCardProps {
  device: DeviceDetail
}

// Kirish/Chiqish juftligi
interface LessonPair {
  entry: string // kirish vaqti
  exit: string // chiqish vaqti
}

// Jadval turi
type ScheduleType = 'school' | 'university' | 'custom'

// Jadval generatori sozlamalari
interface ScheduleGeneratorConfig {
  type: ScheduleType
  startTime: string // Birinchi dars boshlanishi
  lessonDuration: number // Dars davomiyligi (minutda)
  shortBreak: number // Oddiy tanaffus (minutda)
  longBreak: number // Katta tanaffus (minutda)
  longBreakAfter: number // Nechta darsdan keyin katta tanaffus
  lessonsCount: number // Darslar soni
}

// Default sozlamalar
const SCHEDULE_PRESETS: Record<
  ScheduleType,
  Omit<ScheduleGeneratorConfig, 'type'>
> = {
  school: {
    startTime: '08:00',
    lessonDuration: 45,
    shortBreak: 5,
    longBreak: 15,
    longBreakAfter: 3,
    lessonsCount: 7,
  },
  university: {
    startTime: '08:30',
    lessonDuration: 80, // 1 soat 20 minut
    shortBreak: 10,
    longBreak: 30,
    longBreakAfter: 2,
    lessonsCount: 4,
  },
  custom: {
    startTime: '08:00',
    lessonDuration: 45,
    shortBreak: 5,
    longBreak: 15,
    longBreakAfter: 3,
    lessonsCount: 6,
  },
}

// Jadval generatsiya qilish
function generateSchedule(config: ScheduleGeneratorConfig): LessonPair[] {
  const pairs: LessonPair[] = []
  const [startHour, startMin] = config.startTime.split(':').map(Number)
  let currentMinutes = startHour * 60 + startMin

  for (let i = 0; i < config.lessonsCount; i++) {
    // Dars boshlanishi
    const entryHour = Math.floor(currentMinutes / 60)
    const entryMin = currentMinutes % 60
    const entry = `${String(entryHour).padStart(2, '0')}:${String(entryMin).padStart(2, '0')}`

    // Dars tugashi
    currentMinutes += config.lessonDuration
    const exitHour = Math.floor(currentMinutes / 60)
    const exitMin = currentMinutes % 60
    const exit = `${String(exitHour).padStart(2, '0')}:${String(exitMin).padStart(2, '0')}`

    pairs.push({ entry, exit })

    // Tanaffus qo'shish (oxirgi darsdan keyin emas)
    if (i < config.lessonsCount - 1) {
      const isLongBreak = (i + 1) % config.longBreakAfter === 0
      currentMinutes += isLongBreak ? config.longBreak : config.shortBreak
    }
  }

  return pairs
}

// Vaqtlar ro'yxatidan juftliklar yaratish
function timesToPairs(times: string[]): LessonPair[] {
  const pairs: LessonPair[] = []
  const sorted = [...times].sort()
  for (let i = 0; i < sorted.length; i += 2) {
    pairs.push({
      entry: sorted[i] || '',
      exit: sorted[i + 1] || '',
    })
  }
  return pairs
}

// Juftliklardan vaqtlar ro'yxati
function pairsToTimes(pairs: LessonPair[]): string[] {
  const times: string[] = []
  pairs.forEach((pair) => {
    if (pair.entry) times.push(pair.entry)
    if (pair.exit) times.push(pair.exit)
  })
  return times.sort()
}

// Dars davomiyligini hisoblash (minutlarda)
function calculateDuration(entry: string, exit: string): number | null {
  if (!entry || !exit) return null
  const [eh, em] = entry.split(':').map(Number)
  const [xh, xm] = exit.split(':').map(Number)
  const entryMinutes = eh * 60 + em
  const exitMinutes = xh * 60 + xm
  return exitMinutes - entryMinutes
}

// Jadval generatori dialog komponenti
function ScheduleGeneratorDialog({
  onGenerate,
}: {
  onGenerate: (pairs: LessonPair[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<ScheduleGeneratorConfig>({
    type: 'school',
    ...SCHEDULE_PRESETS.school,
  })

  const handleTypeChange = (type: ScheduleType) => {
    setConfig({
      type,
      ...SCHEDULE_PRESETS[type],
    })
  }

  const handleGenerate = () => {
    const pairs = generateSchedule(config)
    onGenerate(pairs)
    setOpen(false)
  }

  const previewPairs = generateSchedule(config)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type='button' variant='outline' size='sm' className='gap-2'>
          <Wand2 className='h-4 w-4' />
          Jadval yaratish
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Settings2 className='h-5 w-5' />
            Jadval generatori
          </DialogTitle>
          <DialogDescription>
            Ta'lim muassasasi turini tanlang va jadval parametrlarini sozlang
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-6 py-4'>
          {/* Tur tanlash */}
          <div className='grid grid-cols-3 gap-3'>
            <button
              type='button'
              onClick={() => handleTypeChange('school')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                config.type === 'school'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              )}
            >
              <School className='h-8 w-8 text-blue-600' />
              <span className='font-medium'>Maktab</span>
              <span className='text-xs text-muted-foreground'>45 min dars</span>
            </button>
            <button
              type='button'
              onClick={() => handleTypeChange('university')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                config.type === 'university'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              )}
            >
              <Building2 className='h-8 w-8 text-purple-600' />
              <span className='font-medium'>Universitet</span>
              <span className='text-xs text-muted-foreground'>80 min dars</span>
            </button>
            <button
              type='button'
              onClick={() => handleTypeChange('custom')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                config.type === 'custom'
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              )}
            >
              <Settings2 className='h-8 w-8 text-gray-600' />
              <span className='font-medium'>Maxsus</span>
              <span className='text-xs text-muted-foreground'>
                O'zingiz sozlang
              </span>
            </button>
          </div>

          <Separator />

          {/* Parametrlar */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='startTime'>Birinchi dars boshlanishi</Label>
              <Input
                id='startTime'
                type='time'
                value={config.startTime}
                onChange={(e) =>
                  setConfig({ ...config, startTime: e.target.value })
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='lessonsCount'>Darslar soni</Label>
              <Select
                value={String(config.lessonsCount)}
                onValueChange={(v) =>
                  setConfig({ ...config, lessonsCount: Number(v) })
                }
              >
                <SelectTrigger id='lessonsCount'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} ta dars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='lessonDuration'>Dars davomiyligi (min)</Label>
              <Select
                value={String(config.lessonDuration)}
                onValueChange={(v) =>
                  setConfig({ ...config, lessonDuration: Number(v) })
                }
              >
                <SelectTrigger id='lessonDuration'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[30, 35, 40, 45, 50, 55, 60, 70, 80, 90].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} daqiqa{' '}
                      {n >= 60 &&
                        `(${Math.floor(n / 60)} soat ${n % 60 > 0 ? `${n % 60} min` : ''})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='shortBreak'>Oddiy tanaffus (min)</Label>
              <Select
                value={String(config.shortBreak)}
                onValueChange={(v) =>
                  setConfig({ ...config, shortBreak: Number(v) })
                }
              >
                <SelectTrigger id='shortBreak'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} daqiqa
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='longBreak'>Katta tanaffus (min)</Label>
              <Select
                value={String(config.longBreak)}
                onValueChange={(v) =>
                  setConfig({ ...config, longBreak: Number(v) })
                }
              >
                <SelectTrigger id='longBreak'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} daqiqa
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='longBreakAfter'>Katta tanaffus (har ...)</Label>
              <Select
                value={String(config.longBreakAfter)}
                onValueChange={(v) =>
                  setConfig({ ...config, longBreakAfter: Number(v) })
                }
              >
                <SelectTrigger id='longBreakAfter'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Har {n} darsdan keyin
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Ko'rib chiqish */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Jadval ko'rinishi
            </Label>
            <div className='max-h-48 overflow-y-auto rounded-lg border bg-muted/30 p-3'>
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4'>
                {previewPairs.map((pair, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 rounded-md bg-background p-2 text-sm'
                  >
                    <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                      {index + 1}
                    </span>
                    <span className='font-mono text-xs'>
                      {pair.entry} - {pair.exit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              Jami: {previewPairs.length} ta dars, {previewPairs.length * 2} ta
              qo'ng'iroq
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleGenerate} className='gap-2'>
            <Check className='h-4 w-4' />
            Qo'llash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ScheduleCard({ device }: ScheduleCardProps) {
  const queryClient = useQueryClient()
  const schedule = device.schedule

  // Local state for editing
  const [pairs, setPairs] = useState<LessonPair[]>(() =>
    schedule?.times ? timesToPairs(schedule.times) : []
  )
  const [isActive, setIsActive] = useState(schedule?.is_active ?? true)
  const [hasChanges, setHasChanges] = useState(false)

  const syncMutation = useSyncSchedule()
  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()

  const isLoading =
    syncMutation.isPending ||
    createMutation.isPending ||
    updateMutation.isPending

  // Reset local state when schedule changes
  useEffect(() => {
    if (schedule) {
      setPairs(timesToPairs(schedule.times))
      setIsActive(schedule.is_active)
      setHasChanges(false)
    }
  }, [schedule])

  // Check for changes
  useEffect(() => {
    if (!schedule) {
      // New schedule - check if any times entered
      const times = pairsToTimes(pairs)
      setHasChanges(times.length > 0)
    } else {
      // Existing schedule - compare
      const currentTimes = pairsToTimes(pairs).sort().join(',')
      const originalTimes = [...schedule.times].sort().join(',')
      setHasChanges(
        currentTimes !== originalTimes || isActive !== schedule.is_active
      )
    }
  }, [pairs, isActive, schedule])

  const handlePairChange = (
    index: number,
    field: 'entry' | 'exit',
    value: string
  ) => {
    const newPairs = [...pairs]
    newPairs[index] = { ...newPairs[index], [field]: value }
    setPairs(newPairs)
  }

  const addPair = () => {
    // Oxirgi darsdan keyin avtomatik vaqt qo'shish
    const lastPair = pairs[pairs.length - 1]
    let newEntry = ''
    if (lastPair?.exit) {
      const [h, m] = lastPair.exit.split(':').map(Number)
      const newMinutes = h * 60 + m + 5 // 5 minut tanaffus
      const newHour = Math.floor(newMinutes / 60)
      const newMin = newMinutes % 60
      newEntry = `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`
    }
    setPairs([...pairs, { entry: newEntry, exit: '' }])
  }

  const removePair = (index: number) => {
    setPairs(pairs.filter((_, i) => i !== index))
  }

  const handleGeneratedSchedule = (generatedPairs: LessonPair[]) => {
    setPairs(generatedPairs)
  }

  const clearAll = () => {
    setPairs([])
  }

  const handleSave = () => {
    const times = pairsToTimes(pairs)

    if (schedule) {
      // Update existing
      updateMutation.mutate(
        {
          id: schedule.id,
          data: { times, is_active: isActive },
          autoSync: false,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: deviceKeys.detail(device.id),
            })
            setHasChanges(false)
          },
        }
      )
    } else {
      // Create new
      createMutation.mutate(
        {
          device: device.id,
          times,
          is_active: isActive,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: deviceKeys.detail(device.id),
            })
            setHasChanges(false)
          },
        }
      )
    }
  }

  const handleSync = () => {
    if (schedule) {
      syncMutation.mutate(schedule.id)
    }
  }

  const needsSync = schedule?.sync_pending || false
  const versionMismatch = schedule?.version != null &&
    device.device_schedule_version != null &&
    schedule.version > device.device_schedule_version
  const validPairsCount = pairs.filter((p) => p.entry && p.exit).length

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='bg-muted/30 pb-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Calendar className='h-5 w-5 text-primary' />
              Qo'ng'iroq jadvali
            </CardTitle>
            <CardDescription className='flex items-center gap-2'>
              {validPairsCount > 0 ? (
                <>
                  <GraduationCap className='h-4 w-4' />
                  {validPairsCount} ta dars · {validPairsCount * 2} ta
                  qo'ng'iroq
                  {schedule?.version != null && (
                    <span className='text-xs text-muted-foreground'>
                      (v{schedule.version})
                    </span>
                  )}
                </>
              ) : (
                "Dars vaqtlarini qo'shing"
              )}
            </CardDescription>
          </div>
          <div className='flex items-center gap-3'>
            {/* Status badges */}
            {device.schedule_stale && (
              <Badge variant='outline' className='gap-1 border-yellow-500 text-yellow-600'>
                <Clock className='h-3 w-3' />
                Eskirgan (7+ kun)
              </Badge>
            )}
            {versionMismatch && !needsSync && (
              <Badge variant='outline' className='gap-1 border-orange-500 text-orange-600'>
                <AlertCircle className='h-3 w-3' />
                v{device.device_schedule_version} → v{schedule?.version}
              </Badge>
            )}
            {needsSync && (
              <Badge variant='destructive' className='gap-1'>
                <AlertCircle className='h-3 w-3' />
                Sinxronlanmagan
              </Badge>
            )}
            {hasChanges && (
              <Badge
                variant='outline'
                className='gap-1 border-amber-500 text-amber-600'
              >
                <RefreshCw className='h-3 w-3' />
                O'zgartirilgan
              </Badge>
            )}
            <div className='flex items-center gap-2 rounded-full bg-background px-3 py-1.5'>
              <Switch
                id='schedule-active'
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label
                htmlFor='schedule-active'
                className='cursor-pointer text-sm font-medium'
              >
                {isActive ? 'Faol' : 'Nofaol'}
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-4'>
        {/* Quick actions */}
        <div className='mb-4 flex gap-2'>
          <ScheduleGeneratorDialog onGenerate={handleGeneratedSchedule} />
          {pairs.length > 0 && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={clearAll}
              className='text-muted-foreground hover:text-destructive'
            >
              Tozalash
            </Button>
          )}
        </div>

        {/* Lesson pairs */}
        {pairs.length > 0 ? (
          <div className='space-y-2'>
            {/* Header */}
            <div className='grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 px-1 text-xs font-medium text-muted-foreground'>
              <span className='w-8'>Dars</span>
              <span className='text-center'>Kirish</span>
              <span className='text-center'>Chiqish</span>
              <span className='w-9'></span>
            </div>

            <Separator />

            {pairs.map((pair, index) => {
              const duration = calculateDuration(pair.entry, pair.exit)
              const isValid = pair.entry && pair.exit
              const hasError = duration !== null && duration <= 0

              return (
                <div
                  key={index}
                  className={cn(
                    'group grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 rounded-lg p-2 transition-colors',
                    'hover:bg-muted/50',
                    hasError && 'bg-destructive/10'
                  )}
                >
                  {/* Dars raqami */}
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
                    {index + 1}
                  </div>

                  {/* Kirish */}
                  <div className='relative'>
                    <Input
                      type='time'
                      value={pair.entry}
                      onChange={(e) =>
                        handlePairChange(index, 'entry', e.target.value)
                      }
                      className={cn(
                        'h-10 border-green-200 bg-green-50/50 text-center font-mono focus:border-green-500 focus:ring-green-500 dark:border-green-900 dark:bg-green-950/30',
                        !pair.entry && 'border-dashed'
                      )}
                    />
                    {!pair.entry && (
                      <span className='pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground'>
                        --:--
                      </span>
                    )}
                  </div>

                  {/* Chiqish */}
                  <div className='relative'>
                    <Input
                      type='time'
                      value={pair.exit}
                      onChange={(e) =>
                        handlePairChange(index, 'exit', e.target.value)
                      }
                      className={cn(
                        'h-10 border-red-200 bg-red-50/50 text-center font-mono focus:border-red-500 focus:ring-red-500 dark:border-red-900 dark:bg-red-950/30',
                        !pair.exit && 'border-dashed',
                        hasError && 'border-destructive'
                      )}
                    />
                    {!pair.exit && (
                      <span className='pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground'>
                        --:--
                      </span>
                    )}
                  </div>

                  {/* Davomiylik va o'chirish */}
                  <div className='flex items-center gap-1'>
                    {isValid && !hasError && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className='hidden text-xs text-muted-foreground sm:inline'>
                              {duration} daq
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Dars davomiyligi: {duration} daqiqa</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removePair(index)}
                      className='h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100'
                    >
                      <Trash2 className='h-4 w-4 text-muted-foreground hover:text-destructive' />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 text-center'>
            <Clock className='mb-3 h-10 w-10 text-muted-foreground/50' />
            <p className='mb-1 font-medium'>Jadval bo'sh</p>
            <p className='mb-4 text-sm text-muted-foreground'>
              Jadval yarating yoki qo'lda dars qo'shing
            </p>
            <div className='flex gap-2'>
              <ScheduleGeneratorDialog onGenerate={handleGeneratedSchedule} />
              <Button variant='outline' size='sm' onClick={addPair}>
                <Plus className='mr-2 h-4 w-4' />
                Qo'lda qo'shish
              </Button>
            </div>
          </div>
        )}

        {/* Add pair button */}
        {pairs.length > 0 && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addPair}
            className='mt-3 w-full border-dashed'
          >
            <Plus className='mr-2 h-4 w-4' />
            {pairs.length + 1}-dars qo'shish
          </Button>
        )}

        {/* Action buttons */}
        <div className='mt-4 flex gap-2'>
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges}
            className={cn(
              'flex-1 gap-2',
              hasChanges &&
                'bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/40'
            )}
          >
            <Check className='h-4 w-4' />
            {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>

          {schedule && (
            <Button
              variant={needsSync ? 'destructive' : 'outline'}
              onClick={handleSync}
              disabled={isLoading || !schedule || hasChanges}
              className='gap-2'
            >
              <Send className='h-4 w-4' />
              Sinxronlash
            </Button>
          )}
        </div>

        {/* Help text */}
        {hasChanges && schedule && (
          <p className='mt-2 text-center text-xs text-muted-foreground'>
            Avval o'zgarishlarni saqlang, keyin sinxronlang
          </p>
        )}

        {/* Version sync info */}
        {schedule && schedule.version != null && (
          <div className='mt-3 flex items-center justify-between rounded-md border px-3 py-2 text-xs text-muted-foreground'>
            <span>Server versiya: v{schedule.version}</span>
            <span>
              Qurilma versiya:{' '}
              {device.device_schedule_version != null
                ? `v${device.device_schedule_version}`
                : '—'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
