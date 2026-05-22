import { apiClient } from '@/lib/api-client'
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '@/features/auth/types'

const AUTH_ENDPOINTS = {
  login: '/auth/login/',
  logout: '/auth/logout/',
  refresh: '/auth/refresh/',
  me: '/auth/me/',
  register: '/auth/register/',
  verifyEmail: '/auth/verify-email/',
  resendVerification: '/auth/resend-verification/',
  forgotPassword: '/auth/forgot-password/',
} as const

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      AUTH_ENDPOINTS.login,
      data
    )
    return response.data
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      AUTH_ENDPOINTS.register,
      data
    )
    return response.data
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (
    data: VerifyEmailRequest
  ): Promise<VerifyEmailResponse> => {
    const response = await apiClient.post<VerifyEmailResponse>(
      AUTH_ENDPOINTS.verifyEmail,
      data
    )
    return response.data
  },

  /**
   * Resend verification email
   */
  resendVerification: async (
    data: ResendVerificationRequest
  ): Promise<ResendVerificationResponse> => {
    const response = await apiClient.post<ResendVerificationResponse>(
      AUTH_ENDPOINTS.resendVerification,
      data
    )
    return response.data
  },

  /**
   * Logout and blacklist refresh token
   */
  logout: async (data: LogoutRequest): Promise<void> => {
    await apiClient.post(AUTH_ENDPOINTS.logout, data)
  },

  /**
   * Refresh access token
   */
  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>(
      AUTH_ENDPOINTS.refresh,
      data
    )
    return response.data
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>(AUTH_ENDPOINTS.me)
    return response.data
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: Partial<AuthUser>): Promise<AuthUser> => {
    const response = await apiClient.patch<AuthUser>(AUTH_ENDPOINTS.me, data)
    return response.data
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: { email: string }): Promise<void> => {
    await apiClient.post(AUTH_ENDPOINTS.forgotPassword, data)
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    email: string
    token: string
    new_password: string
  }): Promise<void> => {
    await apiClient.post('/auth/reset-password/', data)
  },
}
