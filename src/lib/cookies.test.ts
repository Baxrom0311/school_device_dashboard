import { describe, it, expect, beforeEach } from 'vitest'
import { getCookie, setCookie, removeCookie } from './cookies'

describe('cookies', () => {
  beforeEach(() => {
    // Clear all cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.trim().split('=')[0] + '=; max-age=0; path=/'
    })
  })

  describe('setCookie', () => {
    it('sets a cookie with default max-age', () => {
      setCookie('test_key', 'test_value')
      expect(document.cookie).toContain('test_key=test_value')
    })

    it('overwrites existing cookie', () => {
      setCookie('key', 'old')
      setCookie('key', 'new')
      expect(getCookie('key')).toBe('new')
    })
  })

  describe('getCookie', () => {
    it('returns value for existing cookie', () => {
      setCookie('access_token', 'abc123')
      expect(getCookie('access_token')).toBe('abc123')
    })

    it('returns undefined for non-existent cookie', () => {
      expect(getCookie('nonexistent')).toBeUndefined()
    })

    it('handles multiple cookies', () => {
      setCookie('a', '1')
      setCookie('b', '2')
      expect(getCookie('a')).toBe('1')
      expect(getCookie('b')).toBe('2')
    })
  })

  describe('removeCookie', () => {
    it('removes an existing cookie', () => {
      setCookie('token', 'xyz')
      expect(getCookie('token')).toBe('xyz')
      removeCookie('token')
      expect(getCookie('token')).toBeUndefined()
    })

    it('does not throw for non-existent cookie', () => {
      expect(() => removeCookie('ghost')).not.toThrow()
    })
  })
})
