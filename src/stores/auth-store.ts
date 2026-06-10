import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'
import { navigateTo } from '@/lib/router'
import { authApi } from '@/features/auth/api'
import type { AuthUser } from '@/features/auth/types'

const AUTH_STORAGE_KEY = 'auth-storage'
const AUTH_LOGOUT_CHANNEL = 'auth-logout'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function getRedirectPathByRole(
  role: string | undefined
): string {
  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    return '/'
  }
  return '/'
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setUser: (user: AuthUser | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setAccessToken: (accessToken: string) => void
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      accessToken: getCookie(ACCESS_TOKEN_KEY) || null,
      refreshToken: getCookie(REFRESH_TOKEN_KEY) || null,
      isAuthenticated: !!getCookie(ACCESS_TOKEN_KEY),

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) => {
        setCookie(ACCESS_TOKEN_KEY, accessToken)
        setCookie(REFRESH_TOKEN_KEY, refreshToken)
        set({ accessToken, refreshToken, isAuthenticated: true })
      },

      setAccessToken: (accessToken) => {
        setCookie(ACCESS_TOKEN_KEY, accessToken)
        set({ accessToken })
      },

      login: (accessToken, refreshToken, user) => {
        setCookie(ACCESS_TOKEN_KEY, accessToken)
        setCookie(REFRESH_TOKEN_KEY, refreshToken)
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },

      logout: async () => {
        const { refreshToken } = get()
        try {
          if (refreshToken) {
            await authApi.logout({ refresh: refreshToken })
          }
        } catch {
          // Logout endpoint may fail (network down, token already invalid).
          // Always proceed to clear local state.
        } finally {
          get().reset()
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const user = await authApi.getMe()
          set({ user, isLoading: false })
        } catch (error: unknown) {
          set({ isLoading: false })
          const status =
            typeof error === 'object' && error !== null && 'response' in error
              ? (error as { response?: { status?: number } }).response?.status
              : undefined
          if (status === 401 || status === 403) {
            get().reset()
          }
        }
      },

      reset: () => {
        removeCookie(ACCESS_TOKEN_KEY)
        removeCookie(REFRESH_TOKEN_KEY)
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)

// Cross-tab auth sync: logout in one tab → all tabs logout
if (typeof window !== 'undefined') {
  const bc = new BroadcastChannel(AUTH_LOGOUT_CHANNEL)
  bc.onmessage = (event) => {
    if (event.data === 'logout') {
      useAuthStore.getState().reset()
      navigateTo('/sign-in', { replace: true })
    }
  }

  // Patch logout to broadcast
  const originalLogout = useAuthStore.getState().logout
  useAuthStore.setState({
    logout: async () => {
      await originalLogout()
      bc.postMessage('logout')
    },
  })
}
