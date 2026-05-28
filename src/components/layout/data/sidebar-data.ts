import {
  Activity,
  AlertTriangle,
  AudioWaveform,
  Bell,
  Calendar,
  Clock,
  Command,
  Cpu,
  Download,
  FileText,
  GalleryVerticalEnd,
  HelpCircle,
  LayoutDashboard,
  Monitor,
  Palette,
  PartyPopper,
  Settings,
  Shield,
  UserCheck,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@school.uz',
    avatar: '/avatars/admin.jpg',
  },
  teams: [
    {
      name: 'School Device',
      logo: Command,
      plan: 'IoT Management',
    },
    {
      name: "Maktab Qo'ng'irog'i",
      logo: GalleryVerticalEnd,
      plan: 'ESP8266 System',
    },
    {
      name: 'Smart School',
      logo: AudioWaveform,
      plan: 'Automation',
    },
  ],
  navGroups: [
    {
      title: 'Asosiy',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Qurilmalar',
          icon: Cpu,
          items: [
            {
              title: 'Barcha qurilmalar',
              url: '/devices',
              icon: Monitor,
            },
            {
              title: "Ro'yxatdan o'tgan",
              url: '/devices?registration_status=registered',
              icon: UserCheck,
            },
            {
              title: 'Kutilmoqda',
              url: '/devices?registration_status=pending',
              icon: Clock,
            },
          ],
        },
        {
          title: 'Jadvallar',
          url: '/schedules',
          icon: Calendar,
        },
        {
          title: 'Bayramlar',
          url: '/holidays',
          icon: PartyPopper,
        },
        {
          title: 'Favqulodda',
          url: '/emergency',
          icon: AlertTriangle,
        },
        {
          title: 'Firmware',
          icon: Download,
          items: [
            {
              title: 'Versiyalar',
              url: '/firmware',
              icon: Download,
            },
            {
              title: 'OTA Yangilanishlar',
              url: '/ota-batches',
              icon: Activity,
            },
          ],
        },
        {
          title: 'Foydalanuvchilar',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Qurilma Loglari',
          url: '/device-logs',
          icon: FileText,
        },
        {
          title: 'Audit Log',
          url: '/audit-log',
          icon: Shield,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
