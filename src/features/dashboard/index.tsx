import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { PushNotificationPrompt } from '@/components/push-notification-prompt'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useOfflineDetection } from '@/features/devices/hooks'
import { useEmergencyWs } from '@/features/emergency/use-emergency-ws'
import { ApModeAlerts } from './components/ap-mode-alerts'
import { BellActivityChart } from './components/bell-activity-chart'
import { DeviceHealthOverview } from './components/device-health-overview'
import { FirmwareChart } from './components/firmware-chart'
import { QuickActions } from './components/quick-actions'
import { RecentAlerts } from './components/recent-alerts'
import { RecentDevices } from './components/recent-devices'
import { RecentLogs } from './components/recent-logs'
import { RtcBatteryAlerts } from './components/rtc-battery-alerts'
import { StaleScheduleAlerts } from './components/stale-schedule-alerts'
import { StatsCards } from './components/stats-cards'
import { SystemArchitecture } from './components/system-architecture'
import { WorkflowGuide } from './components/workflow-guide'

const topNav = [
  { title: 'Dashboard', href: '/', isActive: true },
  { title: 'Qurilmalar', href: '/devices', isActive: false },
  { title: 'Jadvallar', href: '/schedules', isActive: false },
  { title: 'Firmware', href: '/firmware', isActive: false },
]

export function Dashboard() {
  // Detect devices going offline and show toast notifications
  useOfflineDetection()
  // Real-time emergency alert updates via WebSocket
  useEmergencyWs()

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground'>
              Maktab qo'ng'iroq qurilmalarini boshqarish tizimi
            </p>
          </div>
        </div>

        {/* Push Notification Prompt */}
        <PushNotificationPrompt />

        {/* AP Mode Alerts */}
        <ApModeAlerts />

        {/* RTC Battery Alerts */}
        <RtcBatteryAlerts />

        {/* Stale Schedule Alerts */}
        <StaleScheduleAlerts />

        {/* Quick Actions */}
        <div className='mb-4'>
          <QuickActions />
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Charts and Recent Activity */}
        <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6'>
          {/* Firmware Chart */}
          <FirmwareChart />

          {/* Recent Devices */}
          <RecentDevices />
        </div>

        {/* Recent Logs */}
        <div className='mt-6'>
          <RecentLogs />
        </div>

        {/* Recent Alerts */}
        <div className='mt-6 grid gap-4 lg:grid-cols-6'>
          <RecentAlerts />
          <DeviceHealthOverview />
        </div>

        {/* Workflow Guide and Architecture */}
        <div className='mt-6 grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <WorkflowGuide />
          </div>
          <div className='space-y-6'>
            <BellActivityChart />
            <SystemArchitecture />
          </div>
        </div>
      </Main>
    </>
  )
}
