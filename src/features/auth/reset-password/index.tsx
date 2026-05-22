import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

export function ResetPassword() {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Parolni tiklash
          </CardTitle>
          <CardDescription>
            Emailingizga yuborilgan kodni va yangi parolni kiriting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
        <CardFooter>
          <p className='mx-auto px-8 text-center text-sm text-balance text-muted-foreground'>
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >
              Kirish sahifasiga qaytish
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
