import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeviceStats } from '@/features/devices/hooks'

const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
]

export function FirmwareChart() {
  const { data: stats, isLoading } = useDeviceStats()

  if (isLoading) {
    return (
      <Card className='col-span-4 lg:col-span-3'>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-4 w-60' />
        </CardHeader>
        <CardContent className='flex h-[300px] items-center justify-center'>
          <Skeleton className='h-48 w-48 rounded-full' />
        </CardContent>
      </Card>
    )
  }

  const firmwareData = stats?.firmware_versions
    ? Object.entries(stats.firmware_versions).map(
        ([version, count], index) => ({
          name: `v${version}`,
          value: count,
          color: COLORS[index % COLORS.length],
        })
      )
    : []

  if (firmwareData.length === 0) {
    return (
      <Card className='col-span-4 lg:col-span-3'>
        <CardHeader>
          <CardTitle>Firmware Versiyalari</CardTitle>
          <CardDescription>Qurilmalar firmware taqsimoti</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[300px] items-center justify-center'>
          <p className='text-muted-foreground'>Ma'lumot mavjud emas</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='col-span-4 lg:col-span-3'>
      <CardHeader>
        <CardTitle>Firmware Versiyalari</CardTitle>
        <CardDescription>
          Qurilmalar firmware taqsimoti ({firmwareData.length} xil versiya)
        </CardDescription>
      </CardHeader>
      <CardContent className='h-[300px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={firmwareData}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey='value'
              label={(props) =>
                `${props.name} (${((props.percent ?? 0) * 100).toFixed(0)}%)`
              }
            >
              {firmwareData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value ?? 0} qurilma`, 'Soni']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
