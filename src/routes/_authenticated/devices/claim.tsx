import { createFileRoute } from '@tanstack/react-router'
import { DeviceClaim } from '@/features/devices/claim'

export const Route = createFileRoute('/_authenticated/devices/claim')({
  component: DeviceClaim,
})
