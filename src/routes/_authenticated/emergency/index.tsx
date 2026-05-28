import { RouteErrorBoundary } from '@/components/error-boundary'
import { createFileRoute } from '@tanstack/react-router'
import { EmergencyPage } from '@/features/emergency'

export const Route = createFileRoute('/_authenticated/emergency/')({
  component: EmergencyPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorBoundary error={error} reset={reset} />
  ),
})
