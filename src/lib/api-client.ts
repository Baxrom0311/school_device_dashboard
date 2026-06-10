import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { getCookie, removeCookie, setCookie } from '@/lib/cookies'
import { isTokenExpired } from '@/lib/jwt'
import { navigateTo } from '@/lib/router'
import { useAuthStore } from '@/stores/auth-store'

// API Base URL - o'zgartiring
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Token refresh state
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const doRefresh = async (): Promise<string | null> => {
  const refreshToken = getCookie(REFRESH_TOKEN_KEY)
  if (!refreshToken || isTokenExpired(refreshToken)) return null
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/auth/refresh/`,
    { refresh: refreshToken }
  )
  const newToken = response.data.access
  setCookie(ACCESS_TOKEN_KEY, newToken)
  useAuthStore.getState().setAccessToken(newToken)
  return newToken
}

// Request interceptor - token qo'shish (with expiry pre-check)
apiClient.interceptors.request.use(
  async (config) => {
    let token = getCookie(ACCESS_TOKEN_KEY)

    if (token && isTokenExpired(token) && !config.url?.includes('/auth/')) {
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = doRefresh()
          .then((newToken) => {
            processQueue(null, newToken)
            return newToken
          })
          .catch((err) => {
            processQueue(err instanceof Error ? err : new Error('refresh failed'), null)
            return null
          })
          .finally(() => {
            isRefreshing = false
            refreshPromise = null
          })
      }
      // All concurrent requests wait on the same promise
      token = await (refreshPromise ?? Promise.resolve(null)) ?? undefined
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - xatoliklarni boshqarish va token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // 401 - Token muddati tugagan, refresh qilish kerak
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Agar login endpoint bo'lsa, refresh qilmaslik
      if (originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Agar refresh jarayoni davom etayotgan bo'lsa, queue'ga qo'shish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getCookie(REFRESH_TOKEN_KEY)

      if (!refreshToken) {
        // Refresh token yo'q, login sahifasiga yo'naltirish
        removeCookie(ACCESS_TOKEN_KEY)
        removeCookie(REFRESH_TOKEN_KEY)
        useAuthStore.getState().reset()
        navigateTo('/sign-in', { replace: true })
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        )

        const { access } = response.data
        setCookie(ACCESS_TOKEN_KEY, access)
        useAuthStore.getState().setAccessToken(access)

        processQueue(null, access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error, null)

        // Refresh token ham yaroqsiz, login sahifasiga yo'naltirish
        removeCookie(ACCESS_TOKEN_KEY)
        removeCookie(REFRESH_TOKEN_KEY)
        useAuthStore.getState().reset()
        navigateTo('/sign-in', { replace: true })

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Boshqa xatoliklar - faqat network errors uchun toast ko'rsatish
    // (mutation/query onError callbacks handle specific errors)
    if (!error.response) {
      toast.error('Tarmoq xatoligi', {
        description: "Serverga ulanib bo'lmadi. Internet aloqangizni tekshiring.",
      })
    }

    return Promise.reject(error)
  }
)

export default apiClient
