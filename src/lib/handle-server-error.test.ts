import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { handleServerError } from './handle-server-error'

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

import { toast } from 'sonner'

describe('handleServerError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows detail from axios error response', () => {
    const error = new AxiosError('fail', '400', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      data: { detail: 'Email already exists' },
      headers: {},
      config: { headers: new AxiosHeaders() },
    })
    handleServerError(error)
    expect(toast.error).toHaveBeenCalledWith('Email already exists')
  })

  it('falls back to message field', () => {
    const error = new AxiosError('fail', '400', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      data: { message: 'Invalid input' },
      headers: {},
      config: { headers: new AxiosHeaders() },
    })
    handleServerError(error)
    expect(toast.error).toHaveBeenCalledWith('Invalid input')
  })

  it('shows default message for unknown errors', () => {
    handleServerError(new Error('random'))
    expect(toast.error).toHaveBeenCalledWith('Something went wrong!')
  })

  it('handles 204 status object', () => {
    handleServerError({ status: 204 })
    expect(toast.error).toHaveBeenCalledWith('Content not found.')
  })
})
