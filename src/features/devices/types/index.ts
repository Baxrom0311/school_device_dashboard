// ============== Device Types ==============
export type DeviceStatus =
  | 'online'
  | 'offline'
  | 'active'
  | 'inactive'
  | 'maintenance'
  | 'decommissioned'

export type RegistrationStatus = 'unregistered' | 'pending' | 'registered'

export interface Device {
  id: string
  device_id: string
  school_name: string
  name?: string
  address: string
  description: string
  status: DeviceStatus
  firmware_version: string
  rtc_synced: boolean
  registration_status: RegistrationStatus
  registered_at: string | null
  last_seen?: string | null
  created_at: string
  updated_at: string
}

export interface DeviceListItem {
  id: string
  device_id: string
  school_name: string
  name?: string
  mac_address?: string
  status: DeviceStatus
  firmware_version: string
  rtc_synced: boolean
  has_schedule: boolean
  registration_status: RegistrationStatus
  registered_at: string | null
  last_seen?: string | null
  schedules_count?: number
}

export interface DeviceDetail extends Device {
  mac_address?: string
  target_firmware: string | null
  target_firmware_version: string | null
  needs_ota_update: boolean
  schedule: ScheduleNested | null
  api_key: string | null
  is_registered: boolean
}

export interface DeviceCreate {
  device_id: string
  school_name: string
  address?: string
  description?: string
  status?: DeviceStatus
}

// ============== API Key Types ==============
export interface DeviceAPIKey {
  id: string
  device_id: string
  api_key: string
  registration_status: RegistrationStatus
  registered_at: string | null
  warning?: string
}

// ============== Credentials Types ==============
export interface DeviceCredentials {
  id: string
  device_id: string
  school_name: string
  api_key: string
  registration_status: RegistrationStatus
  mqtt_broker: string
  mqtt_port: number
  mqtt_username: string
  mqtt_password: string
  mqtt_use_tls: boolean
  topics: {
    command: string
    data: string
    status: string
    diagnostics: string
  }
  warning?: string
}

export interface DeviceStats {
  total_devices: number
  registered_devices: number
  pending_devices: number
  rtc_errors: number
  firmware_versions: Record<string, number>
}

// ============== Schedule Types ==============
export interface ScheduleNested {
  id: string
  times: string[]
  times_count: number
  is_active: boolean
  sync_pending: boolean
}

export interface Schedule {
  id: string
  device: string
  device_id: string
  device_school_name: string
  times: string[]
  is_active: boolean
  timezone: string
  synced_at: string | null
  sync_pending: boolean
  created_at: string
  updated_at: string
}

export interface ScheduleCreate {
  device: string
  times: string[]
  is_active?: boolean
  timezone?: string
}

export interface ScheduleUpdate {
  times?: string[]
  is_active?: boolean
  timezone?: string
}

// ============== Firmware Types ==============
export interface FirmwareVersion {
  id: string
  version: string
  file: string
  checksum: string
  file_size: number
  changelog: string
  is_stable: boolean
  min_version: string
  rollout_percentage: number
  created_at: string
  updated_at: string
}

export interface FirmwareListItem {
  id: string
  version: string
  is_stable: boolean
  file_size: number
  created_at: string
}

export interface FirmwareCreate {
  version: string
  file: File
  changelog?: string
  is_stable?: boolean
  min_version?: string
}

// ============== OTA Batch Types ==============
export type OTABatchStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
export type OTADeviceStatus =
  | 'pending'
  | 'notified'
  | 'downloading'
  | 'success'
  | 'failed'
  | 'skipped'

export interface OTABatch {
  id: string
  name: string
  firmware: string
  firmware_version: string
  status: OTABatchStatus
  devices_per_hour: number
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  total_devices: number
  success_count: number
  failed_count: number
  created_at: string
}

export interface OTABatchDevice {
  id: string
  batch: string
  device: string
  device_id: string
  status: OTADeviceStatus
  notified_at: string | null
  completed_at: string | null
  error_message: string
}

// ============== Device Log Types ==============
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical'
export type LogSource = 'device' | 'server' | 'mqtt'

export interface DeviceLog {
  id: string
  device: string
  device_id: string
  level: LogLevel
  source: LogSource
  message: string
  metadata: Record<string, unknown>
  created_at: string
}

// ============== API Response Types ==============
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ActionResponse {
  status: 'success' | 'error' | 'queued'
  message: string
  [key: string]: unknown
}

export interface BulkActionResponse {
  status: string
  total: number
  success: number
  failed: number
  offline?: number
  results?: Record<string, boolean>
  details?: Array<{
    device_id: string
    status: string
    message?: string
  }>
}

// ============== Device Claim Types ==============
export interface DeviceClaimRequest {
  device_id: string
  device_name?: string
}

export interface DeviceClaimResponse {
  status: string
  message: string
  device: {
    id: string
    device_id: string
    school_name: string
    status: DeviceStatus
    registration_status: RegistrationStatus
    registered_at: string
    owner_email: string
  }
}
