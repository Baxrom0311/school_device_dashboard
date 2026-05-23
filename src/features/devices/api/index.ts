import apiClient from '@/lib/api-client'
import type {
  ActionResponse,
  BulkActionResponse,
  Device,
  DeviceAPIKey,
  DeviceClaimRequest,
  DeviceClaimResponse,
  DeviceCreate,
  DeviceCredentials,
  DeviceDetail,
  DeviceListItem,
  DeviceLog,
  DeviceStats,
  FirmwareListItem,
  FirmwareVersion,
  OTABatch,
  OTABatchDevice,
  PaginatedResponse,
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
} from '../types'

// ============== Device API ==============
export const deviceApi = {
  // List devices
  list: async (params?: {
    page?: number
    search?: string
    status?: string
    registration_status?: string
    firmware_version?: string
    ordering?: string
  }) => {
    const response = await apiClient.get<PaginatedResponse<DeviceListItem>>(
      '/devices/',
      { params }
    )
    return response.data
  },

  // Get device detail
  get: async (id: string) => {
    const response = await apiClient.get<DeviceDetail>(`/devices/${id}/`)
    return response.data
  },

  // Create device
  create: async (data: DeviceCreate) => {
    const response = await apiClient.post<Device>('/devices/', data)
    return response.data
  },

  // Update device
  update: async (id: string, data: Partial<DeviceCreate>) => {
    const response = await apiClient.patch<Device>(`/devices/${id}/`, data)
    return response.data
  },

  // Delete device
  delete: async (id: string) => {
    await apiClient.delete(`/devices/${id}/`)
  },

  // Get stats
  stats: async () => {
    const response = await apiClient.get<DeviceStats>('/devices/stats/')
    return response.data
  },

  // Ring device
  ring: async (id: string, duration: number = 5) => {
    const response = await apiClient.post<ActionResponse>(
      `/devices/${id}/ring/`,
      { duration }
    )
    return response.data
  },

  // Restart device
  restart: async (id: string) => {
    const response = await apiClient.post<ActionResponse>(
      `/devices/${id}/restart/`
    )
    return response.data
  },

  // NTP sync
  ntpSync: async (id: string) => {
    const response = await apiClient.post<ActionResponse>(
      `/devices/${id}/ntp_sync/`
    )
    return response.data
  },

  // OTA update single device
  otaUpdate: async (id: string) => {
    const response = await apiClient.post<ActionResponse>(
      `/devices/${id}/ota_update/`
    )
    return response.data
  },

  // Bulk ring
  bulkRing: async (deviceIds: string[]) => {
    const response = await apiClient.post<BulkActionResponse>(
      '/devices/bulk_ring/',
      {
        device_ids: deviceIds,
      }
    )
    return response.data
  },

  // Bulk OTA
  bulkOta: async (deviceIds: string[], firmwareId: string) => {
    const response = await apiClient.post<BulkActionResponse>(
      '/devices/bulk_ota/',
      {
        device_ids: deviceIds,
        firmware_id: firmwareId,
      }
    )
    return response.data
  },

  // Get offline devices
  offline: async () => {
    const response =
      await apiClient.get<PaginatedResponse<DeviceListItem>>(
        '/devices/offline/'
      )
    return response.data
  },

  // Get RTC error devices
  rtcErrors: async () => {
    const response = await apiClient.get<PaginatedResponse<DeviceListItem>>(
      '/devices/rtc_errors/'
    )
    return response.data
  },

  // Get device credentials
  getCredentials: async (id: string) => {
    const response = await apiClient.get<DeviceCredentials>(
      `/devices/${id}/credentials/`
    )
    return response.data
  },

  // Regenerate device credentials
  regenerateCredentials: async (id: string) => {
    const response = await apiClient.post<DeviceCredentials>(
      `/devices/${id}/regenerate_credentials/`
    )
    return response.data
  },

  // Get credentials by device_id
  getCredentialsByDeviceId: async (deviceId: string) => {
    const response = await apiClient.get<DeviceCredentials>(
      `/devices/by-device-id/${deviceId}/credentials/`
    )
    return response.data
  },

  // ============== API Key & Registration ==============

  // Get device API key
  getApiKey: async (id: string) => {
    const response = await apiClient.get<DeviceAPIKey>(
      `/devices/${id}/api_key/`
    )
    return response.data
  },

  // Regenerate API key
  regenerateApiKey: async (id: string) => {
    const response = await apiClient.post<DeviceAPIKey>(
      `/devices/${id}/regenerate_api_key/`
    )
    return response.data
  },

  // Register device (mark as claimed)
  register: async (id: string) => {
    const response = await apiClient.post<DeviceAPIKey>(
      `/devices/${id}/register/`
    )
    return response.data
  },

  // Unregister device
  unregister: async (id: string) => {
    const response = await apiClient.post<DeviceAPIKey>(
      `/devices/${id}/unregister/`
    )
    return response.data
  },

  // Get unregistered devices
  unregistered: async () => {
    const response = await apiClient.get<PaginatedResponse<DeviceListItem>>(
      '/devices/unregistered/'
    )
    return response.data
  },

  // Activate device with API key (used by ESP32 firmware)
  activateWithApiKey: async (apiKey: string) => {
    const response = await apiClient.post<DeviceCredentials>(
      '/devices/activate/',
      { api_key: apiKey }
    )
    return response.data
  },

  // ============== Auto-Registration ==============

  // Get pending devices (waiting for approval)
  pending: async () => {
    const response =
      await apiClient.get<PaginatedResponse<DeviceListItem>>(
        '/devices/pending/'
      )
    return response.data
  },

  // Approve a pending device
  approve: async (
    id: string,
    data: { school_name: string; address?: string; description?: string }
  ) => {
    const response = await apiClient.post<{
      status: string
      message: string
      device: DeviceDetail
    }>(`/devices/${id}/approve/`, data)
    return response.data
  },

  // ============== Device Claiming ==============

  // Claim a device by MAC address
  claim: async (data: DeviceClaimRequest) => {
    const response = await apiClient.post<DeviceClaimResponse>(
      '/devices/claim/',
      data
    )
    return response.data
  },

  // Get my devices (owned by current user)
  myDevices: async () => {
    const response = await apiClient.get<PaginatedResponse<DeviceListItem>>(
      '/devices/my_devices/'
    )
    return response.data
  },

  // Lightweight status polling (minimal data for real-time updates)
  statusPoll: async () => {
    const response = await apiClient.get<
      Array<{
        id: string
        device_id: string
        status: string
        last_seen: string | null
        rtc_synced: boolean
        registration_status: string
        firmware_version: string
      }>
    >('/devices/status-poll/')
    return response.data
  },
}

// ============== Schedule API ==============
export const scheduleApi = {
  // List schedules
  list: async (params?: {
    page?: number
    search?: string
    is_active?: boolean
    sync_pending?: boolean
  }) => {
    const response = await apiClient.get<PaginatedResponse<Schedule>>(
      '/schedules/',
      { params }
    )
    return response.data
  },

  // Get schedule
  get: async (id: string) => {
    const response = await apiClient.get<Schedule>(`/schedules/${id}/`)
    return response.data
  },

  // Create schedule
  create: async (data: ScheduleCreate) => {
    const response = await apiClient.post<Schedule>('/schedules/', data)
    return response.data
  },

  // Update schedule
  update: async (
    id: string,
    data: ScheduleUpdate,
    autoSync: boolean = false
  ) => {
    const response = await apiClient.patch<Schedule>(
      `/schedules/${id}/?auto_sync=${autoSync}`,
      data
    )
    return response.data
  },

  // Delete schedule
  delete: async (id: string) => {
    await apiClient.delete(`/schedules/${id}/`)
  },

  // Sync to device
  syncToDevice: async (id: string) => {
    const response = await apiClient.post<ActionResponse>(
      `/schedules/${id}/sync_to_device/`
    )
    return response.data
  },

  // Bulk sync
  bulkSync: async (scheduleIds?: string[]) => {
    const response = await apiClient.post<BulkActionResponse>(
      '/schedules/bulk_sync/',
      {
        schedule_ids: scheduleIds,
      }
    )
    return response.data
  },
}

// ============== Firmware API ==============
export const firmwareApi = {
  // List firmware versions
  list: async (params?: { page?: number; ordering?: string }) => {
    const response = await apiClient.get<PaginatedResponse<FirmwareListItem>>(
      '/firmware/',
      { params }
    )
    return response.data
  },

  // Get firmware detail
  get: async (id: string) => {
    const response = await apiClient.get<FirmwareVersion>(`/firmware/${id}/`)
    return response.data
  },

  // Upload firmware
  create: async (data: FormData) => {
    const response = await apiClient.post<FirmwareVersion>('/firmware/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Update firmware metadata
  update: async (id: string, data: Partial<FirmwareVersion>) => {
    const response = await apiClient.patch<FirmwareVersion>(
      `/firmware/${id}/`,
      data
    )
    return response.data
  },

  // Delete firmware
  delete: async (id: string) => {
    await apiClient.delete(`/firmware/${id}/`)
  },

  // Get latest stable
  latest: async () => {
    const response = await apiClient.get<FirmwareVersion>('/firmware/latest/')
    return response.data
  },

  // Mark as stable
  markStable: async (id: string) => {
    const response = await apiClient.post<FirmwareVersion>(
      `/firmware/${id}/mark_stable/`
    )
    return response.data
  },

  // Get adoption stats
  adoption: async (id: string) => {
    const response = await apiClient.get<{
      total: number
      adopted: number
      percentage: number
    }>(`/firmware/${id}/adoption/`)
    return response.data
  },
}

// ============== OTA Batch API ==============
export const otaBatchApi = {
  // List batches
  list: async (params?: { page?: number; status?: string }) => {
    const response = await apiClient.get<PaginatedResponse<OTABatch>>(
      '/ota-batches/',
      { params }
    )
    return response.data
  },

  // Get batch detail
  get: async (id: string) => {
    const response = await apiClient.get<OTABatch>(`/ota-batches/${id}/`)
    return response.data
  },

  // Create batch
  create: async (data: {
    name: string
    firmware_id: string
    device_ids: string[]
    devices_per_hour?: number
    scheduled_at?: string
  }) => {
    const response = await apiClient.post<OTABatch>('/ota-batches/', data)
    return response.data
  },

  // Perform action on batch (start, cancel, retry_failed)
  action: async (id: string, action: 'start' | 'cancel' | 'retry_failed') => {
    const response = await apiClient.post<OTABatch>(
      `/ota-batches/${id}/action/`,
      { action }
    )
    return response.data
  },

  // Convenience methods
  start: async (id: string) => otaBatchApi.action(id, 'start'),
  cancel: async (id: string) => otaBatchApi.action(id, 'cancel'),
  retryFailed: async (id: string) => otaBatchApi.action(id, 'retry_failed'),

  // Get active batches
  active: async () => {
    const response = await apiClient.get<OTABatch[]>(
      '/ota-batches/active/'
    )
    return response.data
  },

  // Get batch devices
  getDevices: async (id: string, params?: { device_status?: string }) => {
    const response = await apiClient.get<PaginatedResponse<OTABatchDevice>>(
      `/ota-batches/${id}/devices/`,
      { params }
    )
    return response.data
  },
}

// ============== Device Log API ==============
export const deviceLogApi = {
  // List logs
  list: async (params?: {
    page?: number
    device?: string
    level?: string
    source?: string
    ordering?: string
  }) => {
    const response = await apiClient.get<PaginatedResponse<DeviceLog>>(
      '/device-logs/',
      { params }
    )
    return response.data
  },

  // Get log detail
  get: async (id: string) => {
    const response = await apiClient.get<DeviceLog>(`/device-logs/${id}/`)
    return response.data
  },
}
