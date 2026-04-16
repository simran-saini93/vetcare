import { SignIn } from '@clerk/nextjs'
import AuthShell from '@/components/auth/AuthShell'

export const metadata = { title: 'Sign In — VetCare Pro' }

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn />
    </AuthShell>
  )
}
