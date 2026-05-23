import { RouteErrorBoundary } from '@/components/error-boundary'
import { createFileRoute } from '@tanstack/react-router'
import { DeviceLogsPage } from '@/features/device-logs'

export const Route = createFileRoute('/_authenticated/device-logs/')({
  component: DeviceLogsPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorBoundary error={error} reset={reset} />
  ),
})
