import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await logout()
      toast.success('Muvaffaqiyatli chiqildi')
      
      // Preserve current location for redirect after sign-in
      const currentPath = location.href
      navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    } catch (error) {
      // eslint-disable-next-line no-console -- surface logout failures for debugging
      console.error('Logout error:', error)
      toast.error('Chiqishda xatolik yuz berdi')
    } finally {
      setIsLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Chiqish'
      desc="Rostdan ham chiqishni xohlaysizmi? Qayta kirish uchun login qilishingiz kerak bo'ladi."
      confirmText={isLoading ? 'Chiqilmoqda...' : 'Chiqish'}
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}

