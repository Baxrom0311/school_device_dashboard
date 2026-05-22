import { FirmwarePage } from '@/features/firmware'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/firmware/')({
  component: FirmwarePage,
})
