import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Clock, Loader2 } from 'lucide-react'
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
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'

interface ScheduleTemplate {
  id: string
  name: string
  description: string
  entries: Array<{ hour: number; minute: number; duration: number; days: number }>
  is_default: boolean
  entries_count: number
}

interface TemplateSelectorProps {
  deviceIds?: string[]
  onApplied?: () => void
}

export function TemplateSelector({ deviceIds = [], onApplied }: TemplateSelectorProps) {
  const queryClient = useQueryClient()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const { data: templates, isLoading, isError } = useQuery({
    queryKey: ['schedule-templates'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ results: ScheduleTemplate[] }>(
        '/admin/schedules/templates/'
      )
      return data.results ?? data
    },
  })

  const applyMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const body = deviceIds.length ? { device_ids: deviceIds } : { apply_all: true }
      const { data } = await apiClient.post(
        `/admin/schedules/templates/${templateId}/apply/`,
        body
      )
      return data
    },
    onSuccess: (data) => {
      toast.success(`Shablon ${data.count ?? ''} qurilmaga qo'llanildi`)
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      onApplied?.()
    },
    onError: () => toast.error('Shablonni qo\'llab bo\'lmadi'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <p className="text-sm text-destructive">Shablonlarni yuklashda xatolik yuz berdi</p>
      </div>
    )
  }

  if (!templates?.length) {
    return (
      <p className="text-sm text-muted-foreground p-4">
        Hozircha shablonlar yo'q
      </p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {templates.map((template) => (
        <Card key={template.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {template.name}
              </CardTitle>
              {template.is_default && (
                <Badge variant="secondary" className="text-xs">
                  Standart
                </Badge>
              )}
            </div>
            {template.description && (
              <CardDescription className="text-xs">
                {template.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {template.entries_count} ta yozuv
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={applyMutation.isPending}
              onClick={() => setConfirmId(template.id)}
            >
              {applyMutation.isPending ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Check className="mr-1 h-3 w-3" />
              )}
              {deviceIds.length ? 'Qo\'llash' : 'Barchasiga'}
            </Button>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Shablonni qo'llash</AlertDialogTitle>
            <AlertDialogDescription>
              {deviceIds.length
                ? `Shablon ${deviceIds.length} ta qurilmaga qo'llaniladi.`
                : "Shablon barcha qurilmalarga qo'llaniladi."}{' '}
              Tasdiqlaysizmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmId) applyMutation.mutate(confirmId); setConfirmId(null) }}>
              Tasdiqlash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
