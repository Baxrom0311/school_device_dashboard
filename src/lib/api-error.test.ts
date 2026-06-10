import { describe, it, expect } from 'vitest'
import { extractApiErrorMessage } from './api-error'

describe('extractApiErrorMessage', () => {
  it('returns the fallback for non-object errors', () => {
    expect(extractApiErrorMessage(undefined, 'fb')).toBe('fb')
    expect(extractApiErrorMessage(null, 'fb')).toBe('fb')
    expect(extractApiErrorMessage(42, 'fb')).toBe('fb')
  })

  it('returns the string itself if a string is passed', () => {
    expect(extractApiErrorMessage('boom', 'fb')).toBe('boom')
  })

  it('prefers response.data.detail (DRF default)', () => {
    const err = {
      response: { status: 400, data: { detail: 'invalid token' } },
    }
    expect(extractApiErrorMessage(err, 'fb')).toBe('invalid token')
  })

  it('falls through to response.data.message', () => {
    const err = {
      response: { status: 500, data: { message: 'server explodet' } },
    }
    expect(extractApiErrorMessage(err, 'fb')).toBe('server explodet')
  })

  it('uses non_field_errors[0] when present', () => {
    const err = {
      response: { data: { non_field_errors: ['email taken'] } },
    }
    expect(extractApiErrorMessage(err, 'fb')).toBe('email taken')
  })

  it('uses fieldKey[0] when supplied and present', () => {
    const err = {
      response: { data: { device_id: ['MAC already claimed'] } },
    }
    expect(extractApiErrorMessage(err, 'fb', 'device_id')).toBe(
      'MAC already claimed'
    )
  })

  it('falls back to error.message when response.data has nothing', () => {
    const err = { message: 'Network Error' }
    expect(extractApiErrorMessage(err, 'fb')).toBe('Network Error')
  })

  it('does not crash when response is malformed', () => {
    expect(extractApiErrorMessage({ response: null }, 'fb')).toBe('fb')
    expect(extractApiErrorMessage({ response: { data: 'oops' } }, 'fb')).toBe(
      'fb'
    )
  })

  it('does not leak structure when fields are non-string types', () => {
    const err = {
      response: {
        data: { detail: { nested: 'object' }, message: ['arr-msg'] },
      },
    }
    // detail isn't a string → skip; message is array → take first.
    expect(extractApiErrorMessage(err, 'fb')).toBe('arr-msg')
  })
})
