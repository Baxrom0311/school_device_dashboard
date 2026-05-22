import {
  ArrowDown,
  ArrowLeftRight,
  Cloud,
  Database,
  Monitor,
  Server,
  Smartphone,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SystemArchitecture() {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Tizim Arxitekturasi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col items-center gap-2 py-4 text-sm'>
          {/* Row 1: ESP8266 Devices */}
          <div className='flex items-center gap-2 rounded-lg border bg-green-500/10 px-4 py-2'>
            <Smartphone className='h-5 w-5 text-green-600' />
            <span className='font-medium'>ESP8266 Qurilmalar</span>
            <span className='text-xs text-muted-foreground'>(10K+)</span>
          </div>

          <ArrowDown className='h-4 w-4 text-muted-foreground' />
          <span className='text-xs text-muted-foreground'>MQTT Protocol</span>
          <ArrowDown className='h-4 w-4 text-muted-foreground' />

          {/* Row 2: EMQX Broker */}
          <div className='flex items-center gap-2 rounded-lg border bg-blue-500/10 px-4 py-2'>
            <Cloud className='h-5 w-5 text-blue-600' />
            <span className='font-medium'>EMQX Broker</span>
            <span className='text-xs text-muted-foreground'>:1883</span>
          </div>

          <ArrowDown className='h-4 w-4 text-muted-foreground' />

          {/* Row 3: Backend */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 rounded-lg border bg-purple-500/10 px-4 py-2'>
              <Server className='h-5 w-5 text-purple-600' />
              <span className='font-medium'>Django API</span>
            </div>
            <ArrowLeftRight className='h-4 w-4 text-muted-foreground' />
            <div className='flex items-center gap-2 rounded-lg border bg-orange-500/10 px-4 py-2'>
              <Database className='h-5 w-5 text-orange-600' />
              <span className='font-medium'>PostgreSQL</span>
            </div>
          </div>

          <ArrowDown className='h-4 w-4 text-muted-foreground' />
          <span className='text-xs text-muted-foreground'>REST API</span>
          <ArrowDown className='h-4 w-4 text-muted-foreground' />

          {/* Row 4: Frontend */}
          <div className='flex items-center gap-2 rounded-lg border bg-cyan-500/10 px-4 py-2'>
            <Monitor className='h-5 w-5 text-cyan-600' />
            <span className='font-medium'>Admin Panel</span>
            <span className='text-xs text-muted-foreground'>(React)</span>
          </div>
        </div>

        {/* Data Flow Legend */}
        <div className='mt-4 flex flex-wrap justify-center gap-4 border-t pt-4 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 rounded-full bg-green-500' />
            <span>Qurilmalar</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 rounded-full bg-blue-500' />
            <span>MQTT</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 rounded-full bg-purple-500' />
            <span>Backend</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 rounded-full bg-cyan-500' />
            <span>Frontend</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
