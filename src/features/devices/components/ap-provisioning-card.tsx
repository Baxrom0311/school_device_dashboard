import { Copy, Radio, Wifi } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WifiMode } from '@/features/devices/types'

interface ApProvisioningCardProps {
  wifiMode?: WifiMode
  macAddress?: string
}

function getApCredentials(mac?: string) {
  if (!mac) return { ssid: 'SchoolBell_????', password: 'SchoolBell_??????' }
  const clean = mac.replace(/:/g, '').toUpperCase()
  const last4 = clean.slice(-4)
  const last6 = clean.slice(-6)
  return {
    ssid: `SchoolBell_${last4}`,
    password: `SchoolBell_${last6}`,
  }
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text)
  toast.success(`${label} nusxalandi`)
}

export function ApProvisioningCard({ wifiMode, macAddress }: ApProvisioningCardProps) {
  if (wifiMode !== 'ap' && wifiMode !== 'ap_sta') return null

  const { ssid, password } = getApCredentials(macAddress)

  return (
    <Card className='border-orange-500'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Radio className='h-5 w-5 text-orange-500' />
          WiFi Sozlash (AP Mode)
          <Badge variant='outline' className='border-orange-500 text-orange-600'>
            {wifiMode === 'ap_sta' ? 'AP+STA' : 'AP'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          Qurilma WiFi sozlash rejimida. Quyidagi ma'lumotlar bilan ulaning:
        </p>

        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <p className='text-xs text-muted-foreground'>SSID</p>
              <p className='font-mono text-sm font-semibold'>{ssid}</p>
            </div>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => copyToClipboard(ssid, 'SSID')}>
              <Copy className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <p className='text-xs text-muted-foreground'>Parol</p>
              <p className='font-mono text-sm font-semibold'>{password}</p>
            </div>
            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => copyToClipboard(password, 'Parol')}>
              <Copy className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='flex items-center gap-2 rounded-md bg-muted p-3'>
          <Wifi className='h-4 w-4 text-muted-foreground' />
          <div className='text-sm'>
            <span className='text-muted-foreground'>Captive Portal: </span>
            <span className='font-mono font-medium'>192.168.4.1</span>
          </div>
        </div>

        <ol className='list-inside list-decimal space-y-1 text-sm text-muted-foreground'>
          <li>Telefoningizdan yuqoridagi WiFi tarmoqqa ulaning</li>
          <li>Captive portal avtomatik ochiladi (yoki 192.168.4.1 ga kiring)</li>
          <li>Yangi WiFi SSID va parolni kiriting</li>
          <li>Saqlash → Qurilma qayta ishga tushadi</li>
        </ol>
      </CardContent>
    </Card>
  )
}
