import { RouteErrorBoundary } from '@/components/error-boundary'
import { createFileRoute } from '@tanstack/react-router'
import { AuditLogPage } from '@/features/audit-log'

export const Route = createFileRoute('/_authenticated/audit-log/')({
  component: AuditLogPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorBoundary error={error} reset={reset} />
  ),
})
