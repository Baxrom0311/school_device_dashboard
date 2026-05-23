import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { PageSkeleton } from '@/components/page-skeleton'
import { getCookie } from '@/lib/cookies'
import { useAuthStore } from '@/stores/auth-store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const accessToken = getCookie('access_token')

    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // Dashboard is SuperAdmin only — reject non-ADMIN users
    try {
      let user = useAuthStore.getState().user
      if (!user) {
        await useAuthStore.getState().fetchUser()
        user = useAuthStore.getState().user
      }
      if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
        throw redirect({ to: '/sign-in' })
      }
    } catch (e) {
      // Re-throw redirects as-is
      if (e && typeof e === 'object' && 'to' in e) throw e
      // Network/auth errors → redirect to sign-in
      throw redirect({ to: '/sign-in' })
    }
  },
  component: AuthenticatedLayout,
  pendingComponent: PageSkeleton,
})

