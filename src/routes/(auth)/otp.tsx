import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Otp } from '@/features/auth/otp'

const otpSearchSchema = z.object({
  email: z.string().optional(),
  token: z.string().optional(), // DEV ONLY
})

export const Route = createFileRoute('/(auth)/otp')({
  validateSearch: otpSearchSchema,
  component: Otp,
})
