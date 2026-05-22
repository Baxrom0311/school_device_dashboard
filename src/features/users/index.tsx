import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { usersApi } from './api/users-api'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Build API params from URL search params
  const apiParams = {
    page: (search.page as number) || 1,
    page_size: (search.pageSize as number) || 10,
    search: (search.email as string) || undefined,
    role:
      Array.isArray(search.role) && search.role.length > 0
        ? (search.role[0] as 'ADMIN' | 'USER')
        : undefined,
    is_active:
      search.is_active !== undefined && search.is_active.length > 0
        ? search.is_active[0] === 'true'
        : undefined,
    ordering: (search.ordering as string) || undefined,
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', apiParams],
    queryFn: () => usersApi.getUsers(apiParams),
  })

  const users = data?.results || []
  const totalCount = data?.count || 0

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Foydalanuvchilar
            </h2>
            <p className='text-muted-foreground'>
              Foydalanuvchilar va ularning rollarini boshqaring.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable
          data={users}
          search={search}
          navigate={navigate}
          totalCount={totalCount}
          isLoading={isLoading}
          error={error}
        />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
