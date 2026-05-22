import { useMemo, useState } from 'react'
import { CheckCircle, Loader2, Package, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  useCreateOtaBatch,
  useDevices,
  useFirmwareList,
} from '@/features/devices/hooks'

interface OtaCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedFirmwareId?: string
  preselectedDeviceIds?: string[]
}

export function OtaCreateDialog({
  open,
  onOpenChange,
  preselectedFirmwareId,
  preselectedDeviceIds = [],
}: OtaCreateDialogProps) {
  const [name, setName] = useState('')
  const [firmwareId, setFirmwareId] = useState(preselectedFirmwareId || '')
  const [selectedDevices, setSelectedDevices] =
    useState<string[]>(preselectedDeviceIds)
  const [devicesPerHour, setDevicesPerHour] = useState('10')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: firmwareData } = useFirmwareList({})
  const { data: devicesData } = useDevices({ page: 1 })

  const firmwareList = firmwareData?.results || []
  const devicesList = devicesData?.results || []

  const createMutation = useCreateOtaBatch()

  // Filter devices based on search
  const filteredDevices = useMemo(() => {
    if (!searchQuery) return devicesList
    const query = searchQuery.toLowerCase()
    return devicesList.filter(
      (d) =>
        d.device_id.toLowerCase().includes(query) ||
        d.school_name.toLowerCase().includes(query)
    )
  }, [devicesList, searchQuery])

  const handleSelectAll = () => {
    if (selectedDevices.length === filteredDevices.length) {
      setSelectedDevices([])
    } else {
      setSelectedDevices(filteredDevices.map((d) => d.id))
    }
  }

  const handleToggleDevice = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    )
  }

  const handleSubmit = () => {
    if (!name || !firmwareId || selectedDevices.length === 0) return

    createMutation.mutate(
      {
        name,
        firmware_id: firmwareId,
        device_ids: selectedDevices,
        devices_per_hour: parseInt(devicesPerHour) || 10,
      },
      {
        onSuccess: () => {
          // Reset form
          setName('')
          setFirmwareId('')
          setSelectedDevices([])
          setDevicesPerHour('10')
          onOpenChange(false)
        },
      }
    )
  }

  const handleClose = () => {
    setName('')
    setFirmwareId('')
    setSelectedDevices([])
    setDevicesPerHour('10')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Yangi OTA Batch yaratish
          </DialogTitle>
          <DialogDescription>
            Qurilmalarni tanlang va firmware versiyasini belgilang
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Batch Name */}
          <div className='space-y-2'>
            <Label htmlFor='name'>Batch nomi</Label>
            <Input
              id='name'
              placeholder='Masalan: Barcha maktablar yangilanishi'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Firmware Selection */}
          <div className='space-y-2'>
            <Label>Firmware versiyasi</Label>
            <Select value={firmwareId} onValueChange={setFirmwareId}>
              <SelectTrigger>
                <SelectValue placeholder='Versiyani tanlang' />
              </SelectTrigger>
              <SelectContent>
                {firmwareList.map((firmware) => (
                  <SelectItem key={firmware.id} value={firmware.id}>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono'>v{firmware.version}</span>
                      {firmware.is_stable && (
                        <Badge
                          variant='secondary'
                          className='bg-green-100 text-green-700'
                        >
                          Stable
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Devices per hour */}
          <div className='space-y-2'>
            <Label htmlFor='devicesPerHour'>Soatiga nechta qurilma</Label>
            <Select value={devicesPerHour} onValueChange={setDevicesPerHour}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='5'>5 ta</SelectItem>
                <SelectItem value='10'>10 ta</SelectItem>
                <SelectItem value='20'>20 ta</SelectItem>
                <SelectItem value='50'>50 ta</SelectItem>
                <SelectItem value='100'>100 ta (hammasi birga)</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              Qurilmalar bosqichma-bosqich yangilanadi. Katta sonlar tezroq,
              lekin xavfliroq.
            </p>
          </div>

          <Separator />

          {/* Device Selection */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label>Qurilmalarni tanlang</Label>
              <Badge variant='outline'>
                {selectedDevices.length} ta tanlandi
              </Badge>
            </div>

            {/* Search */}
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Qidirish...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            {/* Select All */}
            <div className='flex items-center space-x-2 py-2'>
              <Checkbox
                id='selectAll'
                checked={
                  filteredDevices.length > 0 &&
                  selectedDevices.length === filteredDevices.length
                }
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor='selectAll'
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Hammasini tanlash ({filteredDevices.length} ta)
              </label>
            </div>

            {/* Devices List */}
            <ScrollArea className='h-[200px] rounded-md border p-2'>
              {filteredDevices.length > 0 ? (
                <div className='space-y-2'>
                  {filteredDevices.map((device) => (
                    <div
                      key={device.id}
                      className='flex items-center space-x-3 rounded-md p-2 hover:bg-muted'
                    >
                      <Checkbox
                        id={device.id}
                        checked={selectedDevices.includes(device.id)}
                        onCheckedChange={() => handleToggleDevice(device.id)}
                      />
                      <label
                        htmlFor={device.id}
                        className='flex flex-1 cursor-pointer items-center justify-between'
                      >
                        <div>
                          <span className='font-mono text-sm'>
                            {device.device_id}
                          </span>
                          {device.school_name && (
                            <span className='ml-2 text-sm text-muted-foreground'>
                              ({device.school_name})
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={
                              device.registration_status === 'registered'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {device.registration_status === 'registered'
                              ? "Ro'yxatdan o'tgan"
                              : 'Kutilmoqda'}
                          </Badge>
                          <span className='font-mono text-xs text-muted-foreground'>
                            v{device.firmware_version}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex h-full items-center justify-center text-muted-foreground'>
                  Qurilmalar topilmadi
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !name ||
              !firmwareId ||
              selectedDevices.length === 0 ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Yaratilmoqda...
              </>
            ) : (
              <>
                <CheckCircle className='mr-2 h-4 w-4' />
                Yaratish ({selectedDevices.length} ta qurilma)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
