import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

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
        <div className='flex h-svh w-full flex-col items-center justify-center gap-4'>
          <h1 className='text-4xl font-bold'>Xatolik yuz berdi</h1>
          <p className='text-muted-foreground'>
            Kutilmagan xatolik. Sahifani qayta yuklang.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className='max-w-lg overflow-auto rounded bg-muted p-4 text-sm'>
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={() => window.location.reload()}>
            Sahifani yangilash
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
