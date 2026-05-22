import { DevicesPage } from '@/features/devices/components/devices-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/devices/')({
  component: DevicesPage,
})
