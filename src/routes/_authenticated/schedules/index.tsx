import { SchedulesPage } from '@/features/schedules'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/schedules/')({
  component: SchedulesPage,
})
