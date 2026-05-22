import { apiClient } from '@/lib/api-client'

// ============== User Types ==============
export type UserRole = 'ADMIN' | 'USER'

export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  avatar: string | null
  role: UserRole
  is_active: boolean
  is_verified: boolean
  organization_name: string
  devices_count?: number
  created_at: string
  updated_at: string
}

export interface UserListResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  verified: number
  unverified: number
  admins: number
  users: number
  with_devices: number
  without_devices: number
}

export interface UserListParams {
  search?: string
  role?: UserRole
  is_active?: boolean
  is_verified?: boolean
  page?: number
  page_size?: number
  ordering?: string
}

// ============== API Functions ==============
export const usersApi = {
  // Get users list with pagination and filters
  getUsers: async (params: UserListParams = {}): Promise<UserListResponse> => {
    const queryParams = new URLSearchParams()

    if (params.search) queryParams.set('search', params.search)
    if (params.role) queryParams.set('role', params.role)
    if (params.is_active !== undefined)
      queryParams.set('is_active', String(params.is_active))
    if (params.is_verified !== undefined)
      queryParams.set('is_verified', String(params.is_verified))
    if (params.page) queryParams.set('page', String(params.page))
    if (params.page_size) queryParams.set('page_size', String(params.page_size))
    if (params.ordering) queryParams.set('ordering', params.ordering)

    const response = await apiClient.get<UserListResponse>(
      `/admin/users/?${queryParams.toString()}`
    )
    return response.data
  },

  // Get single user
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/admin/users/${id}/`)
    return response.data
  },

  // Update user
  updateUser: async (
    id: string,
    data: Partial<
      Pick<
        User,
        | 'first_name'
        | 'last_name'
        | 'role'
        | 'is_active'
        | 'is_verified'
        | 'organization_name'
      >
    >
  ): Promise<User> => {
    const response = await apiClient.patch<User>(`/admin/users/${id}/`, data)
    return response.data
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}/`)
  },

  // Set user password (admin)
  setUserPassword: async (
    id: string,
    data: { new_password: string; confirm_password: string }
  ): Promise<{ detail: string }> => {
    const response = await apiClient.post<{ detail: string }>(
      `/admin/users/${id}/set-password/`,
      data
    )
    return response.data
  },

  // Get user stats
  getStats: async (): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>('/admin/users/stats/')
    return response.data
  },
}
