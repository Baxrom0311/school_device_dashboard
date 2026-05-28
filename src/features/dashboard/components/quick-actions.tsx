import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Loader2, PartyPopper, VolumeX } from 'lucide-react'
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
import { apiClient } from '@/lib/api-client'

export function QuickActions() {
  const queryClient = useQueryClient()

  const { data: alerts } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => {
      const resp = await apiClient.get<{ count: number; results: Array<{ resolved: boolean }> }>(
        '/admin/emergency/',
        { params: { page_size: 5 } }
      )
      return resp.data
    },
  })

  const { data: holidays } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const resp = await apiClient.get<{ results: Array<{ date: string; name: string }> }>(
        '/admin/holidays/'
      )
      return resp.data
    },
  })

  const silenceAll = useMutation({
    mutationFn: async () => {
      const resp = await apiClient.post('/admin/holidays/today-silent/')
      return resp.data
    },
    onSuccess: (data) => {
      toast.success(`Bugun bayram! ${data.total} qurilmaga jim buyrug'i yuborildi.`)
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  })

  const activeAlerts = alerts?.results.filter((a) => !a.resolved).length ?? 0

  const today = new Date().toISOString().slice(0, 10)
  const todayHoliday = holidays?.results.find((h) => h.date === today)

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium'>Tezkor amallar</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-wrap gap-2'>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='outline' size='sm' disabled={silenceAll.isPending}>
              {silenceAll.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <VolumeX className='mr-2 h-4 w-4' />
              )}
              Bugun bayram
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bugun bayram qilish</AlertDialogTitle>
              <AlertDialogDescription>
                Barcha aktiv qurilmalarga "jim" buyrug'i yuboriladi. Qurilmalar bugun qo'ng'iroq chalmaydi.
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

        {todayHoliday && (
          <Badge variant='outline' className='flex items-center gap-1 px-3 py-1.5 text-yellow-600 border-yellow-300'>
            <PartyPopper className='h-3.5 w-3.5' />
            Bugun: {todayHoliday.name}
          </Badge>
        )}

        {activeAlerts > 0 && (
          <Badge variant='destructive' className='flex items-center gap-1 px-3 py-1.5'>
            <AlertTriangle className='h-3.5 w-3.5' />
            {activeAlerts} aktiv alert
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
