import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// jsdom in some Node versions returns a localStorage that is missing
// `setItem`/`getItem`/`clear` methods. Zustand's `persist` middleware crashes
// without them, so install a tiny in-memory shim before importing the store.
function installMemoryStorage() {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    setItem: (k, v) => {
      store.set(k, String(v))
    },
    removeItem: (k) => {
      store.delete(k)
    },
    clear: () => {
      store.clear()
    },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: memoryStorage,
  })
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: memoryStorage,
  })
  return memoryStorage
}

const memStorage = installMemoryStorage()

// Mock the auth API so logout's network call is a no-op.
vi.mock('@/features/auth/api', () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn(),
  },
}))

// Mock the navigation helper so the cross-tab logout subscriber doesn't
// try to mutate window.location during tests.
vi.mock('@/lib/router', () => ({
  navigateTo: vi.fn(),
}))

// Provide a minimal BroadcastChannel polyfill for jsdom.
class FakeBroadcastChannel {
  name: string
  onmessage: ((ev: { data: unknown }) => void) | null = null
  constructor(name: string) {
    this.name = name
  }
  postMessage(_data: unknown) {
    /* noop in tests */
  }
  close() {
    /* noop */
  }
}
;(globalThis as unknown as { BroadcastChannel: typeof FakeBroadcastChannel }).BroadcastChannel =
  FakeBroadcastChannel

import { authApi } from '@/features/auth/api'
import type { AuthUser } from '@/features/auth/types'

const mockUser: AuthUser = {
  id: '1',
  email: 'a@b.com',
  username: 'alice',
  first_name: 'Alice',
  last_name: 'A',
  avatar: null,
  role: 'ADMIN',
  is_active: true,
  is_verified: true,
  organization_name: 'School',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    const eq = c.indexOf('=')
    const name = eq > -1 ? c.substring(0, eq).trim() : c.trim()
    if (name) document.cookie = `${name}=; max-age=0; path=/`
  })
}

function clearStorage() {
  try {
    memStorage.clear()
  } catch {
    /* ignore */
  }
}

describe('auth-store', () => {
  beforeEach(async () => {
    clearCookies()
    clearStorage()
    vi.clearAllMocks()
    // Reset module registry so the store is re-evaluated with fresh state.
    vi.resetModules()
  })

  afterEach(() => {
    clearCookies()
    clearStorage()
  })

  it('starts unauthenticated when no cookie is present', async () => {
    const { useAuthStore } = await import('./auth-store')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
  })

  it('login() stores tokens in cookies and updates state', async () => {
    const { useAuthStore } = await import('./auth-store')
    useAuthStore.getState().login('access-1', 'refresh-1', mockUser)

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe('access-1')
    expect(state.refreshToken).toBe('refresh-1')
    expect(state.user).toEqual(mockUser)

    expect(document.cookie).toContain('access_token=access-1')
    expect(document.cookie).toContain('refresh_token=refresh-1')
  })

  it('setTokens() writes tokens without overwriting user', async () => {
    const { useAuthStore } = await import('./auth-store')
    useAuthStore.getState().login('access-1', 'refresh-1', mockUser)
    useAuthStore.getState().setTokens('access-2', 'refresh-2')

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('access-2')
    expect(state.refreshToken).toBe('refresh-2')
    expect(state.user).toEqual(mockUser)
  })

  it('setAccessToken() rotates only the access token', async () => {
    const { useAuthStore } = await import('./auth-store')
    useAuthStore.getState().login('access-1', 'refresh-1', mockUser)
    useAuthStore.getState().setAccessToken('access-rotated')

    expect(useAuthStore.getState().accessToken).toBe('access-rotated')
    expect(useAuthStore.getState().refreshToken).toBe('refresh-1')
    expect(document.cookie).toContain('access_token=access-rotated')
  })

  it('logout() clears cookies, calls authApi.logout, and resets state', async () => {
    const { useAuthStore } = await import('./auth-store')
    useAuthStore.getState().login('access-1', 'refresh-1', mockUser)

    await useAuthStore.getState().logout()

    expect(authApi.logout).toHaveBeenCalledWith({ refresh: 'refresh-1' })
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(document.cookie).not.toContain('access_token=access-1')
  })

  it('logout() still resets state if the API call rejects', async () => {
    vi.mocked(authApi.logout).mockRejectedValueOnce(new Error('network'))
    const { useAuthStore } = await import('./auth-store')
    useAuthStore.getState().login('access-1', 'refresh-1', mockUser)

    await useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
  })

  it('reset() clears tokens and user without contacting the server', async () => {
    const { useAuthStore } = await import('./auth-store')
    useAuthStore.getState().login('access-1', 'refresh-1', mockUser)

    useAuthStore.getState().reset()

    expect(authApi.logout).not.toHaveBeenCalled()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
  })

  it('persists user but not tokens across reloads', async () => {
    const { useAuthStore } = await import('./auth-store')
    useAuthStore.getState().login('access-1', 'refresh-1', mockUser)

    // Persisted blob should contain the user but not the tokens (partialize).
    const persisted = memStorage.getItem('auth-storage')
    expect(persisted).not.toBeNull()
    const parsed = JSON.parse(persisted as string)
    expect(parsed.state.user).toEqual(mockUser)
    expect(parsed.state.accessToken).toBeUndefined()
    expect(parsed.state.refreshToken).toBeUndefined()
    expect(parsed.state.isAuthenticated).toBeUndefined()
  })
})
