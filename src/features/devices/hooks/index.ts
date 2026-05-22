import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  deviceApi,
  deviceLogApi,
  firmwareApi,
  otaBatchApi,
  scheduleApi,
} from '../api'
import type { DeviceCreate, ScheduleCreate, ScheduleUpdate } from '../types'

// ============== Query Keys ==============
export const deviceKeys = {
  all: ['devices'] as const,
  lists: () => [...deviceKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...deviceKeys.lists(), params] as const,
  details: () => [...deviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...deviceKeys.details(), id] as const,
  stats: () => [...deviceKeys.all, 'stats'] as const,
}

export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
}

export const firmwareKeys = {
  all: ['firmware'] as const,
  lists: () => [...firmwareKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...firmwareKeys.lists(), params] as const,
  details: () => [...firmwareKeys.all, 'detail'] as const,
  detail: (id: string) => [...firmwareKeys.details(), id] as const,
  latest: () => [...firmwareKeys.all, 'latest'] as const,
}

export const otaBatchKeys = {
  all: ['ota-batches'] as const,
  lists: () => [...otaBatchKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...otaBatchKeys.lists(), params] as const,
  details: () => [...otaBatchKeys.all, 'detail'] as const,
  detail: (id: string) => [...otaBatchKeys.details(), id] as const,
}

export const deviceLogKeys = {
  all: ['device-logs'] as const,
  lists: () => [...deviceLogKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...deviceLogKeys.lists(), params] as const,
}

// ============== Device Hooks ==============
export function useDevices(params?: Parameters<typeof deviceApi.list>[0]) {
  return useQuery({
    queryKey: deviceKeys.list(params || {}),
    queryFn: () => deviceApi.list(params),
  })
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: deviceKeys.detail(id),
    queryFn: () => deviceApi.get(id),
    enabled: !!id,
  })
}

export function useDeviceStats() {
  return useQuery({
    queryKey: deviceKeys.stats(),
    queryFn: deviceApi.stats,
    refetchInterval: 30000, // Har 30 sekundda yangilash
  })
}

export function useCreateDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeviceCreate) => deviceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceKeys.stats() })
      toast.success("Qurilma muvaffaqiyatli qo'shildi")
    },
    onError: () => {
      toast.error("Qurilma qo'shishda xatolik")
    },
  })
}

export function useUpdateDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DeviceCreate> }) =>
      deviceApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(id) })
      toast.success('Qurilma yangilandi')
    },
    onError: () => {
      toast.error('Qurilma yangilashda xatolik')
    },
  })
}

export function useDeleteDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deviceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceKeys.stats() })
      toast.success("Qurilma o'chirildi")
    },
    onError: () => {
      toast.error("Qurilma o'chirishda xatolik")
    },
  })
}

export function useDeviceRing() {
  return useMutation({
    mutationFn: ({ id, duration }: { id: string; duration?: number }) =>
      deviceApi.ring(id, duration),
    onSuccess: (data) => {
      toast.success(data.message || "Qo'ng'iroq buyrug'i yuborildi")
    },
    onError: () => {
      toast.error("Qo'ng'iroq buyrug'i yuborishda xatolik")
    },
  })
}

export function useDeviceRestart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deviceApi.restart(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() })
      toast.success(data.message || "Qayta ishga tushirish buyrug'i yuborildi")
    },
    onError: () => {
      toast.error("Qayta ishga tushirish buyrug'ida xatolik")
    },
  })
}

export function useDeviceNtpSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deviceApi.ntpSync(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(id) })
      toast.success(data.message || "NTP sinxronizatsiya buyrug'i yuborildi")
    },
    onError: () => {
      toast.error('NTP sinxronizatsiyada xatolik')
    },
  })
}

export function useDeviceOtaUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deviceApi.otaUpdate(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.detail(id) })
      toast.success(data.message || 'OTA yangilanish boshlandi')
    },
    onError: () => {
      toast.error('OTA yangilanishda xatolik')
    },
  })
}

export function useBulkRing() {
  return useMutation({
    mutationFn: (deviceIds: string[]) => deviceApi.bulkRing(deviceIds),
    onSuccess: (data) => {
      toast.success(
        `${data.success}/${data.total} qurilmaga qo'ng'iroq yuborildi`
      )
    },
    onError: () => {
      toast.error("Qo'ng'iroq yuborishda xatolik")
    },
  })
}

export function useDeviceCredentials(id: string) {
  return useQuery({
    queryKey: [...deviceKeys.detail(id), 'credentials'] as const,
    queryFn: () => deviceApi.getCredentials(id),
    enabled: !!id,
  })
}

export function useRegenerateCredentials() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deviceApi.regenerateCredentials(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({
        queryKey: [...deviceKeys.detail(id), 'credentials'],
      })
      if (data.warning) {
        toast.warning(data.warning)
      }
      toast.success('MQTT credentials qayta yaratildi')
    },
    onError: () => {
      toast.error('Credentials qayta yaratishda xatolik')
    },
  })
}

// ============== Schedule Hooks ==============
export function useSchedules(params?: Parameters<typeof scheduleApi.list>[0]) {
  return useQuery({
    queryKey: scheduleKeys.list(params || {}),
    queryFn: () => scheduleApi.list(params),
  })
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => scheduleApi.get(id),
    enabled: !!id,
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ScheduleCreate) => scheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() })
      toast.success('Jadval yaratildi')
    },
    onError: () => {
      toast.error('Jadval yaratishda xatolik')
    },
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
      autoSync,
    }: {
      id: string
      data: ScheduleUpdate
      autoSync?: boolean
    }) => scheduleApi.update(id, data, autoSync),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) })
      toast.success('Jadval yangilandi')
    },
    onError: () => {
      toast.error('Jadval yangilashda xatolik')
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() })
      toast.success("Jadval o'chirildi")
    },
    onError: () => {
      toast.error("Jadval o'chirishda xatolik")
    },
  })
}

export function useSyncSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleApi.syncToDevice(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      toast.success(data.message || 'Jadval qurilmaga yuborildi')
    },
    onError: () => {
      toast.error('Jadval sinxronizatsiyada xatolik')
    },
  })
}

// ============== Firmware Hooks ==============
export function useFirmwareList(
  params?: Parameters<typeof firmwareApi.list>[0]
) {
  return useQuery({
    queryKey: firmwareKeys.list(params || {}),
    queryFn: () => firmwareApi.list(params),
  })
}

export function useFirmware(id: string) {
  return useQuery({
    queryKey: firmwareKeys.detail(id),
    queryFn: () => firmwareApi.get(id),
    enabled: !!id,
  })
}

export function useLatestFirmware() {
  return useQuery({
    queryKey: firmwareKeys.latest(),
    queryFn: firmwareApi.latest,
  })
}

export function useUploadFirmware() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FormData) => firmwareApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: firmwareKeys.lists() })
      toast.success('Firmware yuklandi')
    },
    onError: () => {
      toast.error('Firmware yuklashda xatolik')
    },
  })
}

export function useMarkFirmwareStable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => firmwareApi.markStable(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: firmwareKeys.lists() })
      queryClient.invalidateQueries({ queryKey: firmwareKeys.detail(id) })
      toast.success('Firmware stable deb belgilandi')
    },
    onError: () => {
      toast.error('Xatolik yuz berdi')
    },
  })
}

// ============== OTA Batch Hooks ==============
export function useOtaBatches(params?: Parameters<typeof otaBatchApi.list>[0]) {
  return useQuery({
    queryKey: otaBatchKeys.list(params || {}),
    queryFn: () => otaBatchApi.list(params),
  })
}

export function useOtaBatch(id: string) {
  return useQuery({
    queryKey: otaBatchKeys.detail(id),
    queryFn: () => otaBatchApi.get(id),
    enabled: !!id,
  })
}

export function useCreateOtaBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: otaBatchApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: otaBatchKeys.lists() })
      toast.success('OTA batch yaratildi')
    },
    onError: () => {
      toast.error('OTA batch yaratishda xatolik')
    },
  })
}

export function useCancelOtaBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: otaBatchApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: otaBatchKeys.all })
      toast.success('OTA batch bekor qilindi')
    },
    onError: () => {
      toast.error('OTA batch bekor qilishda xatolik')
    },
  })
}

export function useStartOtaBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: otaBatchApi.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: otaBatchKeys.all })
      toast.success('OTA batch boshlandi')
    },
    onError: () => {
      toast.error('OTA batch boshlashda xatolik')
    },
  })
}

export function useOtaBatchDevices(batchId: string) {
  return useQuery({
    queryKey: [...otaBatchKeys.detail(batchId), 'devices'],
    queryFn: () => otaBatchApi.getDevices(batchId),
    enabled: !!batchId,
  })
}

// ============== Device Log Hooks ==============
export function useDeviceLogs(
  params?: Parameters<typeof deviceLogApi.list>[0]
) {
  return useQuery({
    queryKey: deviceLogKeys.list(params || {}),
    queryFn: () => deviceLogApi.list(params),
  })
}
