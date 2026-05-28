import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { uz } from 'date-fns/locale'
import {
  AlertTriangle,
  CalendarDays,
  List,
  PartyPopper,
  Pencil,
  Plus,
  RefreshCw,
  Repeat,
  Trash2,
  VolumeX,
} from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { apiClient } from '@/lib/api-client'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: false },
  { title: 'Bayramlar', href: '/holidays', isActive: true },
]

interface Holiday {
  id: string
  name: string
  date: string
  recurring: boolean
  created_at: string
}

interface PaginatedHolidays {
  count: number
  results: Holiday[]
}

export function HolidaysPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [recurring, setRecurring] = useState(false)

  const { data: holidays, isLoading, isError } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const resp = await apiClient.get<PaginatedHolidays>('/admin/holidays/')
      return resp.data
    },
  })

  const resetForm = () => {
    setName('')
    setDate('')
    setRecurring(false)
    setEditingHoliday(null)
  }

  const openEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setName(holiday.name)
    setDate(holiday.date)
    setRecurring(holiday.recurring)
    setDialogOpen(true)
  }

  const createHoliday = useMutation({
    mutationFn: async () => {
      if (editingHoliday) {
        await apiClient.patch(`/admin/holidays/${editingHoliday.id}/`, { name, date, recurring })
      } else {
        await apiClient.post('/admin/holidays/', { name, date, recurring })
      }
    },
    onSuccess: () => {
      toast.success(editingHoliday ? 'Bayram yangilandi' : 'Bayram qo\'shildi')
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      setDialogOpen(false)
      resetForm()
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  })

  const deleteHoliday = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/holidays/${id}/`)
    },
    onSuccess: () => {
      toast.success('Bayram o\'chirildi')
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
    },
    onError: () => toast.error('O\'chirishda xatolik'),
  })

  const silenceAll = useMutation({
    mutationFn: async () => {
      const resp = await apiClient.post('/admin/holidays/today-silent/')
      return resp.data
    },
    onSuccess: (data) => {
      toast.success(
        `Bugun bayram! ${data.total} qurilmaga jim buyrug'i yuborilmoqda.`
      )
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  })

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              🎉 Bayram kunlari
            </h1>
            <p className='text-muted-foreground'>
              Bayram sanalarini boshqarish va qurilmalarni jim qilish
            </p>
          </div>
          <div className='flex gap-2'>
            {/* Silence All Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='destructive'
                  disabled={silenceAll.isPending}
                >
                  <VolumeX className='mr-2 h-4 w-4' />
                  Bugun bayram
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bugun bayram qilish</AlertDialogTitle>
                  <AlertDialogDescription>
                    Barcha aktiv qurilmalarga "jim" buyrug'i yuboriladi.
                    Qurilmalar bugun qo'ng'iroq chalmaydi.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                  <AlertDialogAction onClick={() => silenceAll.mutate()}>
                    Tasdiqlash
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Add Holiday */}
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Bayram qo'shish
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingHoliday ? 'Bayramni tahrirlash' : 'Yangi bayram'}</DialogTitle>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Nomi</Label>
                    <Input
                      id='name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder='Mustaqillik kuni'
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='date'>Sana</Label>
                    <Input
                      id='date'
                      type='date'
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Switch
                      id='recurring'
                      checked={recurring}
                      onCheckedChange={setRecurring}
                    />
                    <Label htmlFor='recurring'>
                      Har yili takrorlanadi
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => createHoliday.mutate()}
                    disabled={!name || !date || createHoliday.isPending}
                  >
                    {editingHoliday ? 'Yangilash' : 'Saqlash'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Holidays List + Calendar */}
        <Tabs defaultValue='calendar'>
          <TabsList>
            <TabsTrigger value='calendar'>
              <CalendarDays className='mr-1 h-4 w-4' />
              Kalendar
            </TabsTrigger>
            <TabsTrigger value='list'>
              <List className='mr-1 h-4 w-4' />
              Ro'yxat
            </TabsTrigger>
          </TabsList>

          <TabsContent value='calendar'>
            <Card>
              <CardContent className='pt-6'>
                {isLoading ? (
                  <p className='py-8 text-center text-muted-foreground'>
                    Yuklanmoqda...
                  </p>
                ) : isError ? (
                  <div className='flex flex-col items-center gap-2 py-8 text-center'>
                    <AlertTriangle className='h-5 w-5 text-destructive' />
                    <p className='text-sm text-destructive'>Bayramlarni yuklashda xatolik yuz berdi</p>
                  </div>
                ) : (
                  <HolidayCalendar holidays={holidays?.results ?? []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='list'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <CalendarDays className='h-5 w-5' />
                  Bayramlar ro'yxati
                  {holidays && (
                    <Badge variant='secondary'>{holidays.count}</Badge>
                  )}
                </CardTitle>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ['holidays'] })
                  }
                >
                  <RefreshCw className='h-4 w-4' />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className='py-8 text-center text-muted-foreground'>
                    Yuklanmoqda...
                  </p>
                ) : isError ? (
                  <div className='flex flex-col items-center gap-2 py-8 text-center'>
                    <AlertTriangle className='h-5 w-5 text-destructive' />
                    <p className='text-sm text-destructive'>Bayramlarni yuklashda xatolik yuz berdi</p>
                  </div>
                ) : !holidays?.results.length ? (
                  <p className='py-8 text-center text-muted-foreground'>
                    Bayramlar topilmadi. Yangi bayram qo'shing.
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {holidays.results.map((holiday) => (
                      <div
                        key={holiday.id}
                        className='flex items-center justify-between rounded-md border p-3'
                      >
                        <div className='flex items-center gap-3'>
                          <PartyPopper className='h-5 w-5 text-yellow-500' />
                          <div>
                            <p className='text-sm font-medium'>
                              {holiday.name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {format(new Date(holiday.date), 'd MMMM yyyy', {
                                locale: uz,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          {holiday.recurring && (
                            <Badge variant='outline' className='gap-1'>
                              <Repeat className='h-3 w-3' />
                              Har yili
                            </Badge>
                          )}
                          <Button variant='ghost' size='icon' onClick={() => openEdit(holiday)}>
                            <Pencil className='h-4 w-4 text-muted-foreground' />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <Trash2 className='h-4 w-4 text-destructive' />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Bayramni o'chirish
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{holiday.name}" bayramini o'chirmoqchimisiz?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteHoliday.mutate(holiday.id)}
                                  className='bg-destructive text-destructive-foreground'
                                >
                                  O'chirish
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

function HolidayCalendar({ holidays }: { holidays: Holiday[] }) {
  const holidayDates = holidays.map((h) => parseISO(h.date))

  return (
    <div className='flex flex-col items-center gap-4'>
      <DayPicker
        mode='multiple'
        selected={holidayDates}
        locale={uz}
        numberOfMonths={2}
        modifiers={{ holiday: holidayDates }}
        modifiersClassNames={{
          holiday: 'bg-yellow-200 dark:bg-yellow-900 rounded-full font-bold',
        }}
        disabled
      />
      {holidays.length > 0 && (
        <div className='flex flex-wrap justify-center gap-2'>
          {holidays.map((h) => (
            <Badge key={h.id} variant='outline' className='gap-1'>
              <PartyPopper className='h-3 w-3' />
              {h.name} — {format(parseISO(h.date), 'd MMM', { locale: uz })}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
