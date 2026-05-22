import { createFileRoute } from '@tanstack/react-router'
import { OtaBatchDetailPage } from '@/features/ota'

export const Route = createFileRoute('/_authenticated/ota-batches/$batchId')({
  component: OtaBatchDetailPage,
})
