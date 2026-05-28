import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Upload, Link as LinkIcon, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api-client'

interface ScheduleEntry {
  hour: number
  minute: number
  duration: number
  days: number
}

interface ImportResult {
  entries: ScheduleEntry[]
  count: number
  applied_to?: string
}

interface ICalImportDialogProps {
  deviceId?: string
  onImported?: (entries: ScheduleEntry[]) => void
}

export function ICalImportDialog({ deviceId, onImported }: ICalImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [periodicSync, setPeriodicSync] = useState(false)

  const { data: savedUrl } = useQuery({
    queryKey: ['ical-sync-url'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ url: string | null }>('/admin/schedules/sync-url/')
      return data.url
    },
    retry: false,
  })

  const fileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post<ImportResult>(
        '/admin/schedules/import-ical/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return data
    },
    onSuccess: (data) => {
      toast.success(`${data.count} ta jadval yozuvi import qilindi`)
      onImported?.(data.entries)
      setOpen(false)
      setFile(null)
    },
    onError: () => toast.error('iCal faylni import qilib bo\'lmadi'),
  })

  const urlMutation = useMutation({
    mutationFn: async (calUrl: string) => {
      const { data } = await apiClient.post<ImportResult>('/admin/schedules/import-url/', {
        url: calUrl,
        ...(deviceId && { device_id: deviceId }),
        ...(periodicSync && { save_for_sync: true }),
      })
      return data
    },
    onSuccess: (data) => {
      toast.success(`${data.count} ta jadval yozuvi import qilindi${periodicSync ? ' (avtomatik sinxron yoqildi)' : ''}`)
      onImported?.(data.entries)
      setOpen(false)
      setUrl('')
      setPeriodicSync(false)
    },
    onError: () => toast.error('URL dan import qilib bo\'lmadi'),
  })

  const handleFileSubmit = () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    if (deviceId) formData.append('device_id', deviceId)
    fileMutation.mutate(formData)
  }

  const handleUrlSubmit = () => {
    if (!url) return
    urlMutation.mutate(url)
  }

  const isLoading = fileMutation.isPending || urlMutation.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          iCal Import
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jadval import qilish</DialogTitle>
          <DialogDescription>
            iCal (.ics) fayl yoki Google Calendar URL orqali jadval import qiling
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Fayl yuklash</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ical-file">iCal fayl (.ics)</Label>
              <Input
                id="ical-file"
                type="file"
                accept=".ics,.ical"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleFileSubmit} disabled={!file || isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ical-url">Google Calendar URL</Label>
              <div className="flex gap-2">
                <LinkIcon className="mt-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ical-url"
                  placeholder="https://calendar.google.com/calendar/ical/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="periodic-sync" checked={periodicSync} onCheckedChange={setPeriodicSync} />
              <Label htmlFor="periodic-sync" className="text-sm">
                Avtomatik sinxronlash (har kuni)
              </Label>
            </div>
            {savedUrl && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                <span>Joriy sinxron URL:</span>
                <Badge variant="outline" className="max-w-[200px] truncate text-xs font-normal">
                  {savedUrl}
                </Badge>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleUrlSubmit} disabled={!url || isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
