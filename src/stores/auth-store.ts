import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'
import { authApi } from '@/features/auth/api'
import type { AuthUser } from '@/features/auth/types'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function getRedirectPathByRole(
  role: 'ADMIN' | 'USER' | undefined
): string {
  if (role === 'ADMIN') {
    return '/'
  }
  return '/member'
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
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          get().reset()
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const user = await authApi.getMe()
          set({ user, isLoading: false })
        } catch {
          set({ isLoading: false })
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
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)
