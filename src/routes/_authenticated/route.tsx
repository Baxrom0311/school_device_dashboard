import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { PageSkeleton } from '@/components/page-skeleton'
import { getCookie } from '@/lib/cookies'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const accessToken = getCookie('access_token')
    
    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
  pendingComponent: PageSkeleton,
})

