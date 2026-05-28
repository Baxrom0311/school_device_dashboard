import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useDeviceStatusPoll } from '.'

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

export function useOfflineDetection() {
  const { data: devices } = useDeviceStatusPoll()
  const prevOnlineRef = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (!devices) return

    const now = Date.now()
    const currentOnline = new Set(
      devices
        .filter((d) => d.last_seen && now - new Date(d.last_seen).getTime() < ONLINE_THRESHOLD_MS)
        .map((d) => d.device_id)
    )

    const prev = prevOnlineRef.current
    if (prev) {
      // Detect devices that were online but are now offline
      for (const deviceId of prev) {
        if (!currentOnline.has(deviceId)) {
          toast.warning(`Qurilma offline: ${deviceId}`, {
            description: "Qurilma 5 daqiqadan beri javob bermayapti",
            duration: 10000,
          })
        }
      }
    }

    prevOnlineRef.current = currentOnline
  }, [devices])
}
