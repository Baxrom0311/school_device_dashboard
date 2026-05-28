import { useInfiniteQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import { ClipboardList, Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { apiClient } from '@/lib/api-client'

interface AuditLogEntry {
  id: string
  user: string | null
  user_email: string | null
  action: string
  target_type: string
  target_id: string
  details: Record<string, unknown>
  created_at: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: AuditLogEntry[]
}

const topNav = [
  { title: 'Dashboard', href: '/', isActive: false },
  { title: 'Qurilmalar', href: '/devices', isActive: false },
  { title: 'Audit Log', href: '/audit-log', isActive: true },
]

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState<string>('all')

  const { data, isLoading, refetch, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['audit-logs', actionFilter],
      queryFn: async ({ pageParam }) => {
        const params: Record<string, string> = {}
        if (actionFilter !== 'all') params.action = actionFilter
        if (pageParam) params.cursor = pageParam
        const res = await apiClient.get<PaginatedResponse>('/audit-logs/', { params })
        return res.data
      },
      initialPageParam: '',
      getNextPageParam: (lastPage) => {
        if (!lastPage.next) return undefined
        const url = new URL(lastPage.next)
        return url.searchParams.get('cursor') || url.searchParams.get('page') || undefined
      },
    })

  const logs = data?.pages.flatMap((page) => page.results) ?? []

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Audit Log</h1>
          <div className='flex items-center gap-2'>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Filter' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Barchasi</SelectItem>
                <SelectItem value='create'>Create</SelectItem>
                <SelectItem value='update'>Update</SelectItem>
                <SelectItem value='delete'>Delete</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='icon' onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
          </div>
        ) : !logs.length ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <ClipboardList className='h-12 w-12 text-muted-foreground' />
              <p className='mt-2 text-muted-foreground'>Hozircha log yo'q</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Oxirgi harakatlar ({data?.pages[0]?.count ?? 0} ta)</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {logs.map((log) => (
                <div key={log.id} className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='flex items-center gap-3'>
                    <Badge className={actionColors[log.action] || 'bg-gray-100 text-gray-800'}>
                      {log.action}
                    </Badge>
                    <div>
                      <p className='text-sm font-medium'>
                        {log.target_type} #{log.target_id}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {log.user_email || 'System'}
                      </p>
                    </div>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: uz })}
                  </span>
                </div>
              ))}
              {hasNextPage && (
                <div className='flex justify-center pt-2'>
                  <Button variant='outline' onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : null}
                    Ko'proq yuklash
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
