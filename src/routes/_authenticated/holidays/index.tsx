import { RouteErrorBoundary } from '@/components/error-boundary'
import { HolidaysPage } from '@/features/holidays'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/holidays/')({
  component: HolidaysPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorBoundary error={error} reset={reset} />
  ),
})
