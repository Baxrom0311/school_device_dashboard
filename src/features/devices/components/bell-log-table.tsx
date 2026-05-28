import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { uz } from 'date-fns/locale'
import { AlertTriangle, Bell, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { bellLogApi } from '@/features/devices/api'

const sourceLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  schedule: { label: 'Jadval', variant: 'secondary' },
  manual: { label: 'Qo\'lda', variant: 'outline' },
  emergency: { label: 'Favqulodda', variant: 'destructive' },
  test: { label: 'Test', variant: 'default' },
}

interface BellLogTableProps {
  deviceId: string
}

export function BellLogTable({ deviceId }: BellLogTableProps) {
  const [page, setPage] = useState(1)
  const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
  const endDate = format(new Date(), 'yyyy-MM-dd')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['bell-logs', deviceId, page, startDate, endDate],
    queryFn: () => bellLogApi.list({ device: deviceId, page, start_date: startDate, end_date: endDate }),
    refetchInterval: 30000,
  })

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='flex items-center gap-2'>
          <Bell className='h-5 w-5' />
          Qo'ng'iroq tarixi (7 kun)
          {data && <Badge variant='secondary'>{data.count}</Badge>}
        </CardTitle>
        {totalPages > 1 && (
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-7 w-7' disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-xs text-muted-foreground'>{page}/{totalPages}</span>
            <Button variant='ghost' size='icon' className='h-7 w-7' disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className='py-6 text-center text-muted-foreground'>Yuklanmoqda...</p>
        ) : isError ? (
          <div className='flex flex-col items-center gap-2 py-6 text-center'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
            <p className='text-sm text-destructive'>Ma'lumotlarni yuklashda xatolik yuz berdi</p>
          </div>
        ) : !data?.results.length ? (
          <p className='py-6 text-center text-muted-foreground'>
            Qo'ng'iroq tarixi topilmadi
          </p>
        ) : (
          <div className='space-y-2 max-h-80 overflow-y-auto'>
            {data.results.map((log) => {
              const src = sourceLabels[log.trigger_source] ?? { label: log.trigger_source, variant: 'outline' as const }
              return (
                <div key={log.id} className='flex items-center justify-between rounded-md border px-3 py-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                    <span>{format(new Date(log.rang_at), 'dd.MM HH:mm:ss', { locale: uz })}</span>
                  </div>
                  <span className='text-muted-foreground'>
                    {(log.duration_ms / 1000).toFixed(1)}s
                  </span>
                  <Badge variant={src.variant}>{src.label}</Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
