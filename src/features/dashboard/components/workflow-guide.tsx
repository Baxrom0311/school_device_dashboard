import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code,
  Key,
  Monitor,
  Plus,
  Settings,
  Wifi,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'

interface WorkflowStep {
  id: number
  title: string
  description: string
  role: 'admin' | 'iot' | 'both'
  icon: React.ReactNode
  substeps: string[]
  tips?: string[]
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    title: "Yangi qurilma ro'yxatdan o'tkazish",
    description: "Admin panelda yangi ESP8266 qurilmasini tizimga qo'shish",
    role: 'admin',
    icon: <Plus className='h-5 w-5' />,
    substeps: [
      "Dashboard'dan \"Qurilmalar\" bo'limiga o'ting",
      '"Yangi qurilma qo\'shish" tugmasini bosing',
      'Qurilma ID (MAC yoki custom) kiriting',
      'Maktab nomi va manzilni kiriting',
      '"Saqlash" tugmasini bosing',
      '⚡ Avtomatik MQTT credentials yaratiladi!',
    ],
    tips: [
      "Qurilma ID - noyob bo'lishi kerak",
      "Credentials faqat bir marta ko'rsatiladi - xavfsiz saqlang!",
    ],
  },
  {
    id: 2,
    title: 'MQTT Credentials olish',
    description: "IoT dasturchi uchun ulanish ma'lumotlarini ko'chirish",
    role: 'admin',
    icon: <Key className='h-5 w-5' />,
    substeps: [
      "Qurilma tafsilotlari sahifasiga o'ting",
      '"MQTT Credentials" kartochkasini toping',
      "Broker, Port, Username, Password ma'lumotlarini ko'ring",
      '"Barchasini nusxalash (.env format)" tugmasini bosing',
      "IoT dasturchiga credentials'ni yuboring (xavfsiz kanal orqali)",
    ],
    tips: [
      'Parolni Telegram, Email yoki boshqa xavfsiz usul bilan yuboring',
      'Agar parol yo\'qolsa - "Qayta yaratish" tugmasidan foydalaning',
    ],
  },
  {
    id: 3,
    title: "ESP8266'ni dasturlash",
    description: 'IoT dasturchi qurilmaga credentials kiritadi',
    role: 'iot',
    icon: <Code className='h-5 w-5' />,
    substeps: [
      "Arduino IDE yoki PlatformIO'ni oching",
      'config.h faylini yarating yoki tahrirlang',
      "MQTT credentials'ni kiriting:",
      '  - MQTT_BROKER = "broker.example.com"',
      '  - MQTT_PORT = 1883',
      '  - MQTT_USERNAME = "device_xxx"',
      '  - MQTT_PASSWORD = "xxx..."',
      "WiFi credentials'ni ham kiriting",
      'Kodni kompilyatsiya qiling',
      "ESP8266'ga yuklang (Upload)",
    ],
    tips: [
      "WiFi va MQTT credentials'ni alohida config faylda saqlang",
      "Kodni Git'ga yuklashdan oldin credentials'ni .gitignore qiling",
    ],
  },
  {
    id: 4,
    title: 'Qurilmani ulash va test qilish',
    description: 'ESP8266 ni quvvatlash va serverga ulanishini tekshirish',
    role: 'iot',
    icon: <Wifi className='h-5 w-5' />,
    substeps: [
      "ESP8266'ni quvvat manbaiga ulang",
      "Serial Monitor'da loglarni kuzating",
      'WiFi ulanishini tekshiring',
      "MQTT broker'ga ulanishini tasdiqlang",
      'Admin panelda qurilma "Online" bo\'lishini kutting',
      "Diagnostika ma'lumotlari kelishini tekshiring",
    ],
    tips: [
      'Serial Monitor tezligi: 115200 baud',
      "Agar ulanmasa - WiFi parol va MQTT credentials'ni tekshiring",
    ],
  },
  {
    id: 5,
    title: "Qo'ng'iroq jadvali sozlash",
    description: "Admin qurilma uchun dars qo'ng'iroqlari vaqtini belgilaydi",
    role: 'admin',
    icon: <Calendar className='h-5 w-5' />,
    substeps: [
      "Qurilma tafsilotlari sahifasiga o'ting",
      '"Jadval" kartochkasini toping',
      '"Tahrirlash" tugmasini bosing',
      "Qo'ng'iroq vaqtlarini qo'shing (masalan: 08:30, 09:15, 10:00)",
      '"Saqlash" tugmasini bosing',
      '"Qurilmaga yuborish" tugmasini bosing',
      'Jadval ESP8266 ga MQTT orqali yuboriladi',
    ],
    tips: [
      'Vaqtlarni 24-soat formatida kiriting (08:30, 14:00)',
      "Sync Pending = True bo'lsa, jadval hali qurilmaga yetib bormagan",
    ],
  },
  {
    id: 6,
    title: "Test qo'ng'iroq",
    description: "Qurilma ishlashini tekshirish uchun test qo'ng'iroq",
    role: 'admin',
    icon: <Bell className='h-5 w-5' />,
    substeps: [
      "Qurilma tafsilotlari sahifasiga o'ting",
      '"Qo\'ng\'iroq" tugmasini bosing',
      'Qurilmada buzzer chalinishini kuting (~500ms)',
      'Agar chalinsai - hammasi ishlayapti! ✅',
    ],
    tips: [
      'Qurilma "Online" bo\'lishi kerak',
      'Agar chalmasa - MQTT ulanishini tekshiring',
    ],
  },
  {
    id: 7,
    title: 'Monitoring va texnik xizmat',
    description: 'Qurilmalarni doimiy kuzatish va muammolarni hal qilish',
    role: 'both',
    icon: <Monitor className='h-5 w-5' />,
    substeps: [
      "Dashboard'da statistikani kuzating",
      'Offline qurilmalarni tekshiring',
      "RTC xatolari bo'lgan qurilmalarni aniqlang",
      '"NTP Sync" buyrug\'ini yuboring (vaqt sinxronizatsiyasi)',
      'Firmware yangilanishlarini kuzating',
      'Loglarni tahlil qiling',
    ],
    tips: [
      "Har kuni Dashboard'ni tekshiring",
      'Offline qurilmalar - internet yoki quvvat muammosi',
      "RTC xatosi - batareya almashtirish kerak bo'lishi mumkin",
    ],
  },
]

const roleLabels = {
  admin: { label: 'Admin', color: 'bg-blue-500' },
  iot: { label: 'IoT Dasturchi', color: 'bg-green-500' },
  both: { label: 'Hammasi', color: 'bg-purple-500' },
}

export function WorkflowGuide() {
  const [openSteps, setOpenSteps] = useState<number[]>([1])
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const toggleStep = (stepId: number) => {
    setOpenSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    )
  }

  const toggleComplete = (stepId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Settings className='h-5 w-5' />
          Ishga tushirish yo'riqnomasi
        </CardTitle>
        <CardDescription>
          Yangi qurilmani tizimga qo'shish va sozlash ketma-ketligi
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        {workflowSteps.map((step, index) => (
          <Collapsible
            key={step.id}
            open={openSteps.includes(step.id)}
            onOpenChange={() => toggleStep(step.id)}
          >
            <div
              className={`rounded-lg border transition-colors ${
                completedSteps.includes(step.id)
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'hover:bg-muted/50'
              }`}
            >
              <CollapsibleTrigger asChild>
                <div className='flex cursor-pointer items-center gap-3 p-4'>
                  {/* Step number */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      completedSteps.includes(step.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {completedSteps.includes(step.id) ? (
                      <Check className='h-4 w-4' />
                    ) : (
                      step.id
                    )}
                  </div>

                  {/* Content */}
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      {step.icon}
                      <span className='font-medium'>{step.title}</span>
                      <Badge
                        variant='secondary'
                        className={`${roleLabels[step.role].color} text-white`}
                      >
                        {roleLabels[step.role].label}
                      </Badge>
                    </div>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {step.description}
                    </p>
                  </div>

                  {/* Toggle */}
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={(e) => toggleComplete(step.id, e)}
                      className={
                        completedSteps.includes(step.id) ? 'text-green-500' : ''
                      }
                    >
                      <CheckCircle2 className='h-4 w-4' />
                    </Button>
                    {openSteps.includes(step.id) ? (
                      <ChevronDown className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <ChevronRight className='h-4 w-4 text-muted-foreground' />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className='border-t px-4 pt-3 pb-4'>
                  {/* Substeps */}
                  <div className='space-y-2'>
                    {step.substeps.map((substep, i) => (
                      <div key={i} className='flex items-start gap-2 text-sm'>
                        <ArrowRight className='mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground' />
                        <span
                          className={
                            substep.startsWith(' ') ? 'font-mono text-xs' : ''
                          }
                        >
                          {substep}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  {step.tips && step.tips.length > 0 && (
                    <>
                      <Separator className='my-3' />
                      <div className='rounded-md bg-muted/50 p-3'>
                        <p className='mb-2 text-xs font-medium text-muted-foreground'>
                          💡 Maslahatlar:
                        </p>
                        <ul className='space-y-1'>
                          {step.tips.map((tip, i) => (
                            <li
                              key={i}
                              className='text-xs text-muted-foreground'
                            >
                              • {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </div>

            {/* Arrow between steps */}
            {index < workflowSteps.length - 1 && (
              <div className='flex justify-center py-1'>
                <ChevronDown className='h-4 w-4 text-muted-foreground' />
              </div>
            )}
          </Collapsible>
        ))}

        {/* Progress */}
        <div className='mt-4 rounded-lg bg-muted/50 p-4'>
          <div className='mb-2 flex items-center justify-between text-sm'>
            <span className='font-medium'>Progress</span>
            <span className='text-muted-foreground'>
              {completedSteps.length} / {workflowSteps.length} bajarildi
            </span>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-muted'>
            <div
              className='h-full bg-green-500 transition-all duration-300'
              style={{
                width: `${(completedSteps.length / workflowSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
