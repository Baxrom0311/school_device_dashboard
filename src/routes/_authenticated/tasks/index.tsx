import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/coming-soon'

/**
 * Placeholder route. The original `Tasks` feature shipped with the
 * shadcn-admin template used static data and is not part of the school-bell
 * product surface. We keep the route as a stub so any deep link still
 * resolves; the underlying template code has been removed.
 */
export const Route = createFileRoute('/_authenticated/tasks/')({
  component: ComingSoon,
})
