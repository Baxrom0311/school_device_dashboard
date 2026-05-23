import { RouteErrorBoundary } from '@/components/error-boundary'
import { SchedulesPage } from '@/features/schedules'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/schedules/')({
  component: SchedulesPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorBoundary error={error} reset={reset} />
  ),
})
