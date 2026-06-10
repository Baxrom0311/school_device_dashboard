import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/coming-soon'

/**
 * Placeholder route. The original `Chats` feature was a static-data demo
 * inherited from the shadcn-admin template and is not part of the school-bell
 * product surface. The route remains as a stub so any deep link still
 * resolves.
 */
export const Route = createFileRoute('/_authenticated/chats/')({
  component: ComingSoon,
})
