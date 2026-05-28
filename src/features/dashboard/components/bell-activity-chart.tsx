import { useQuery } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { AlertTriangle, Bell } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { bellLogApi } from '@/features/devices/api'

export function BellActivityChart() {
  const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const endDate = format(new Date(), 'yyyy-MM-dd')

  const { data, isError } = useQuery({
    queryKey: ['bell-logs-chart', startDate, endDate],
    queryFn: () => bellLogApi.list({ start_date: startDate, end_date: endDate, page_size: 200 }),
    refetchInterval: 60000,
  })

  // Group by day
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayStr = format(date, 'yyyy-MM-dd')
    const count = data?.results.filter(
      (log) => format(new Date(log.rang_at), 'yyyy-MM-dd') === dayStr
    ).length ?? 0
    return { day: format(date, 'dd/MM'), count }
  })

  const totalRings = data?.count ?? 0

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
          <Bell className='h-4 w-4' />
          Qo'ng'iroqlar (7 kun)
          <span className='ml-auto text-xs font-normal text-muted-foreground'>
            Jami: {totalRings}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className='flex flex-col items-center gap-2 py-6 text-center'>
            <AlertTriangle className='h-4 w-4 text-destructive' />
            <p className='text-xs text-destructive'>Yuklashda xatolik</p>
          </div>
        ) : (
        <ResponsiveContainer width='100%' height={120}>
          <BarChart data={chartData}>
            <XAxis dataKey='day' tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(value) => [`${value} ta`, "Qo'ng'iroq"]}
            />
            <Bar dataKey='count' fill='hsl(var(--primary))' radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
