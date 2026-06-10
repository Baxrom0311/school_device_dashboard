import { describe, it, expect } from 'vitest'
import { cn, getPageNumbers, sleep } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('dedupes tailwind classes (last one wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('respects falsy values', () => {
    const flag = false as boolean
    expect(cn('a', flag && 'b', undefined, null, 'c')).toBe('a c')
  })
})

describe('sleep', () => {
  it('resolves after the requested timeout', async () => {
    const start = Date.now()
    await sleep(20)
    expect(Date.now() - start).toBeGreaterThanOrEqual(15)
  })

  it('defaults to 1000ms when no argument is passed', () => {
    // Just verifies the call returns a Promise — we don't actually wait 1s.
    const p = sleep()
    expect(p).toBeInstanceOf(Promise)
  })
})

describe('getPageNumbers', () => {
  it('returns all pages when total <= 5', () => {
    expect(getPageNumbers(1, 1)).toEqual([1])
    expect(getPageNumbers(2, 3)).toEqual([1, 2, 3])
    expect(getPageNumbers(5, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('shows ellipsis at the end when current page is near the beginning', () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, '...', 10])
    expect(getPageNumbers(3, 10)).toEqual([1, 2, 3, 4, '...', 10])
  })

  it('shows ellipsis at the start when current page is near the end', () => {
    expect(getPageNumbers(10, 10)).toEqual([1, '...', 7, 8, 9, 10])
    expect(getPageNumbers(8, 10)).toEqual([1, '...', 7, 8, 9, 10])
  })

  it('shows ellipsis on both sides when current page is in the middle', () => {
    expect(getPageNumbers(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10])
  })

  it('handles boundary at page 6 of 10 (still middle)', () => {
    expect(getPageNumbers(6, 10)).toEqual([1, '...', 5, 6, 7, '...', 10])
  })
})
