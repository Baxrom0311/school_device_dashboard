import { Building2, Shield, User } from 'lucide-react'
import { type UserRole, type UserStatus } from './schema'

export const statusStyles = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const verifiedStyles = new Map<boolean, string>([
  [true, 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200'],
  [
    false,
    'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200',
  ],
])

export const roles = [
  {
    label: 'Admin',
    value: 'ADMIN' as UserRole,
    icon: Shield,
  },
  {
    label: 'Maktab Admin',
    value: 'SCHOOL_ADMIN' as UserRole,
    icon: Building2,
  },
  {
    label: 'Foydalanuvchi',
    value: 'USER' as UserRole,
    icon: User,
  },
] as const
