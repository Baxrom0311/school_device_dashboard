import { useState } from 'react'
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  Key,
  Lock,
  RefreshCw,
  Server,
  Shield,
} from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDeviceCredentials,
  useRegenerateCredentials,
} from '@/features/devices/hooks'

interface CredentialsCardProps {
  deviceId: string
}

export function CredentialsCard({ deviceId }: CredentialsCardProps) {
  const {
    data: credentials,
    isLoading,
    refetch,
    isFetching,
  } = useDeviceCredentials(deviceId)
  const regenerateMutation = useRegenerateCredentials()

  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleRegenerate = () => {
    regenerateMutation.mutate(deviceId, {
      onSuccess: () => {
        refetch()
      },
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-20 w-full' />
        </CardContent>
      </Card>
    )
  }

  if (!credentials) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Key className='h-5 w-5' />
            MQTT Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Credentials mavjud emas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <CardTitle className='flex items-center gap-2'>
          <Key className='h-5 w-5' />
          MQTT Credentials
        </CardTitle>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Yangilash
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                size='sm'
                disabled={regenerateMutation.isPending}
              >
                <Lock className='mr-2 h-4 w-4' />
                Qayta yaratish
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5 text-destructive' />
                  Credentials qayta yaratish
                </AlertDialogTitle>
                <AlertDialogDescription className='space-y-2'>
                  <p>
                    Bu amalni bajarishdan oldin quyidagilarni hisobga oling:
                  </p>
                  <ul className='list-inside list-disc space-y-1'>
                    <li>Eski parol darhol ishlamay qoladi</li>
                    <li>
                      Qurilmani yangi credentials bilan qayta yoqish kerak
                      bo'ladi
                    </li>
                    <li>Qurilma MQTT ga ulana olmay qoladi</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRegenerate}
                  className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
                >
                  Qayta yaratish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* MQTT Broker Info */}
        <div className='rounded-lg border bg-muted/30 p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <Server className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium'>MQTT Broker</span>
            {credentials.mqtt_use_tls && (
              <Badge variant='secondary' className='ml-auto'>
                <Shield className='mr-1 h-3 w-3' />
                TLS
              </Badge>
            )}
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Broker</p>
              <div className='flex items-center gap-2'>
                <code className='rounded bg-background px-2 py-1 font-mono text-sm'>
                  {credentials.mqtt_broker}
                </code>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={() =>
                    copyToClipboard(credentials.mqtt_broker, 'broker')
                  }
                >
                  {copiedField === 'broker' ? (
                    <Check className='h-3 w-3 text-green-500' />
                  ) : (
                    <Copy className='h-3 w-3' />
                  )}
                </Button>
              </div>
            </div>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Port</p>
              <div className='flex items-center gap-2'>
                <code className='rounded bg-background px-2 py-1 font-mono text-sm'>
                  {credentials.mqtt_port}
                </code>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={() =>
                    copyToClipboard(String(credentials.mqtt_port), 'port')
                  }
                >
                  {copiedField === 'port' ? (
                    <Check className='h-3 w-3 text-green-500' />
                  ) : (
                    <Copy className='h-3 w-3' />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Authentication */}
        <div className='rounded-lg border bg-muted/30 p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <Key className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium'>Authentication</span>
          </div>
          <div className='space-y-3'>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Username</p>
              <div className='flex items-center gap-2'>
                <code className='rounded bg-background px-2 py-1 font-mono text-sm'>
                  {credentials.mqtt_username}
                </code>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={() =>
                    copyToClipboard(credentials.mqtt_username, 'username')
                  }
                >
                  {copiedField === 'username' ? (
                    <Check className='h-3 w-3 text-green-500' />
                  ) : (
                    <Copy className='h-3 w-3' />
                  )}
                </Button>
              </div>
            </div>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Password</p>
              <div className='flex items-center gap-2'>
                <code className='rounded bg-background px-2 py-1 font-mono text-sm'>
                  {showPassword
                    ? credentials.mqtt_password
                    : '••••••••••••••••'}
                </code>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-3 w-3' />
                  ) : (
                    <Eye className='h-3 w-3' />
                  )}
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={() =>
                    copyToClipboard(credentials.mqtt_password, 'password')
                  }
                >
                  {copiedField === 'password' ? (
                    <Check className='h-3 w-3 text-green-500' />
                  ) : (
                    <Copy className='h-3 w-3' />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* MQTT Topics */}
        <div className='rounded-lg border bg-muted/30 p-4'>
          <div className='mb-3 flex items-center gap-2'>
            <span className='text-sm font-medium'>MQTT Topics</span>
          </div>
          <div className='space-y-2'>
            {Object.entries(credentials.topics).map(([key, value]) => (
              <div
                key={key}
                className='flex items-center justify-between rounded bg-background px-3 py-2'
              >
                <div className='space-y-0.5'>
                  <p className='text-xs text-muted-foreground capitalize'>
                    {key}
                  </p>
                  <code className='font-mono text-sm'>{value}</code>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={() => copyToClipboard(value, key)}
                >
                  {copiedField === key ? (
                    <Check className='h-3 w-3 text-green-500' />
                  ) : (
                    <Copy className='h-3 w-3' />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Copy all button */}
        <Button
          variant='outline'
          className='w-full'
          onClick={() => {
            const allCredentials = `MQTT_BROKER=${credentials.mqtt_broker}
MQTT_PORT=${credentials.mqtt_port}
MQTT_USERNAME=${credentials.mqtt_username}
MQTT_PASSWORD=${credentials.mqtt_password}
MQTT_USE_TLS=${credentials.mqtt_use_tls}
MQTT_TOPIC_COMMAND=${credentials.topics.command}
MQTT_TOPIC_DATA=${credentials.topics.data}
MQTT_TOPIC_STATUS=${credentials.topics.status}`
            copyToClipboard(allCredentials, 'all')
          }}
        >
          {copiedField === 'all' ? (
            <>
              <Check className='mr-2 h-4 w-4 text-green-500' />
              Nusxalandi!
            </>
          ) : (
            <>
              <Copy className='mr-2 h-4 w-4' />
              Barchasini nusxalash (.env format)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
