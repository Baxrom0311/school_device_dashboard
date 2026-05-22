import { createFileRoute } from '@tanstack/react-router'
import { OtaBatchesPage } from '@/features/ota'

export const Route = createFileRoute('/_authenticated/ota-batches/')({
  component: OtaBatchesPage,
})
