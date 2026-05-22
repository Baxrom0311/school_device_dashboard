import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton() {
  return (
    <div className='space-y-6 p-4'>
      {/* Header skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-72' />
      </div>

      {/* Stats cards skeleton */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-28 rounded-xl' />
        ))}
      </div>

      {/* Content skeleton */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className='h-64 rounded-xl' />
        <Skeleton className='h-64 rounded-xl' />
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className='space-y-4 p-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-9 w-24' />
      </div>
      <Skeleton className='h-10 w-full' />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-full' />
      ))}
      <div className='flex justify-end'>
        <Skeleton className='h-9 w-64' />
      </div>
    </div>
  )
}
