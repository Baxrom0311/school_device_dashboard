import { useRouter } from '@tanstack/react-router'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface RouteErrorProps {
  error: Error
  reset?: () => void
}

export function RouteErrorBoundary({ error, reset }: RouteErrorProps) {
  const router = useRouter()

  return (
    <div className='flex h-[50vh] flex-col items-center justify-center gap-4 p-8'>
      <AlertTriangle className='text-destructive h-12 w-12' />
      <h2 className='text-lg font-semibold'>Xatolik yuz berdi</h2>
      <p className='text-muted-foreground max-w-md text-center text-sm'>
        {error.message || "Kutilmagan xatolik. Iltimos, qayta urinib ko'ring."}
      </p>
      <div className='flex gap-2'>
        <button
          onClick={() => {
            reset?.()
            router.invalidate()
          }}
          className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium'
        >
          <RefreshCw className='h-4 w-4' />
          Qayta urinish
        </button>
      </div>
    </div>
  )
}

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex h-svh w-full flex-col items-center justify-center gap-4 p-4'>
          <AlertTriangle className='text-destructive h-12 w-12' />
          <h1 className='text-2xl font-bold'>Xatolik yuz berdi</h1>
          <p className='text-muted-foreground text-center'>
            Kutilmagan xatolik. Sahifani qayta yuklang.
          </p>
          <button
            className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium'
            onClick={() => window.location.reload()}
          >
            Sahifani yangilash
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
