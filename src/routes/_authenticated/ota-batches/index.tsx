import { RouteErrorBoundary } from '@/components/error-boundary'
import { createFileRoute } from '@tanstack/react-router'
import { OtaBatchesPage } from '@/features/ota'

export const Route = createFileRoute('/_authenticated/ota-batches/')({
  component: OtaBatchesPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorBoundary error={error} reset={reset} />
  ),
})
