import { z } from 'zod'

const userStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([z.literal('ADMIN'), z.literal('USER')])
export type UserRole = z.infer<typeof userRoleSchema>

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  avatar: z.string().nullable(),
  role: userRoleSchema,
  is_active: z.boolean(),
  is_verified: z.boolean(),
  organization_name: z.string(),
  devices_count: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
