import { Radio, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { WifiMode } from '@/features/devices/types'

interface WifiModeBadgeProps {
  mode?: WifiMode
}

const modeConfig: Record<WifiMode, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  sta: { label: 'WiFi ulangan', variant: 'default', icon: <Wifi className='h-3 w-3' /> },
  ap: { label: 'AP Mode (sozlash)', variant: 'outline', icon: <Radio className='h-3 w-3' /> },
  ap_sta: { label: 'AP+STA', variant: 'secondary', icon: <Radio className='h-3 w-3' /> },
  disconnected: { label: 'Uzilgan', variant: 'destructive', icon: <WifiOff className='h-3 w-3' /> },
}

export function WifiModeBadge({ mode }: WifiModeBadgeProps) {
  if (!mode) return null
  const config = modeConfig[mode]
  return (
    <Badge variant={config.variant} className='gap-1'>
      {config.icon}
      {config.label}
    </Badge>
  )
}
