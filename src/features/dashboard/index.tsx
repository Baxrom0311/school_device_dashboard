import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { FirmwareChart } from './components/firmware-chart'
import { RecentDevices } from './components/recent-devices'
import { RecentLogs } from './components/recent-logs'
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

        {/* Workflow Guide and Architecture */}
        <div className='mt-6 grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <WorkflowGuide />
          </div>
          <div>
            <SystemArchitecture />
          </div>
        </div>
      </Main>
    </>
  )
}
