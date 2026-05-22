import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UsersPrimaryButtons() {
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }

  return (
    <div className='flex gap-2'>
      <Button variant='outline' className='space-x-1' onClick={handleRefresh}>
        <span>Yangilash</span> <RefreshCw size={18} />
      </Button>
    </div>
  )
}
