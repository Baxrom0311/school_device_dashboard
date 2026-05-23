import { RouteErrorBoundary } from '@/components/error-boundary'
import { DeviceDetailPage } from '@/features/devices/components/device-detail-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/devices/$deviceId')({
  component: DeviceDetailPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorBoundary error={error} reset={reset} />
  ),
})
