import { z } from 'zod'

// Auth User type
export interface AuthUser {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  avatar: string | null
  role: 'ADMIN' | 'SCHOOL_ADMIN' | 'USER'
  is_active: boolean
  is_verified: boolean
  organization_name: string
  created_at: string
  updated_at: string
}

// Login request/response
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: AuthUser
}

// Register request/response
export interface RegisterRequest {
  email: string
  password: string
  confirm_password: string
  username: string
  organization_name?: string
  first_name?: string
  last_name?: string
}

export interface RegisterResponse {
  detail: string
  email: string
  verification_required: boolean
  verification_token?: string // DEV ONLY - remove in production!
}

// Email verification
export interface VerifyEmailRequest {
  email: string
  token: string
}

export interface VerifyEmailResponse {
  detail: string
  access: string
  refresh: string
  user: AuthUser
}

export interface ResendVerificationRequest {
  email: string
}

export interface ResendVerificationResponse {
  detail: string
  email: string
}

// Refresh token
export interface RefreshTokenRequest {
  refresh: string
}

export interface RefreshTokenResponse {
  access: string
}

// Logout request
export interface LogoutRequest {
  refresh: string
}

// Zod schemas for form validation
export const loginSchema = z.object({
  email: z.string().email("Email formati noto'g'ri"),
  password: z.string().min(1, 'Parol kiritilishi shart'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register form schema
export const registerSchema = z
  .object({
    email: z.string().email("Email formati noto'g'ri"),
    username: z.string().min(3, "Username kamida 3 ta belgi bo'lishi kerak"),
    password: z.string().min(7, "Parol kamida 7 ta belgi bo'lishi kerak"),
    confirm_password: z.string().min(1, 'Parolni tasdiqlang'),
    organization_name: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Parollar mos kelmaydi',
    path: ['confirm_password'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Verify email schema
export const verifyEmailSchema = z.object({
  email: z.string().email("Email formati noto'g'ri"),
  token: z.string().min(1, 'Tasdiqlash kodi kiritilishi shart'),
})

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>

// Auth state interface
export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
