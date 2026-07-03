'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Loader2, Lock, ArrowRight, CheckCircle2,
  KeyRound, Eye, EyeOff, AlertCircle
} from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, !!session)
        if (event === 'PASSWORD_RECOVERY' || session) {
          setReady(true)
        }
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccess(true)
      toast.success('Password updated!')
      
      await supabase.auth.signOut()
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1326] p-6">
      <div className="w-full max-w-md">
        <Card className="midnight-card border-[#464554] modal-pop">
          <CardHeader className="space-y-3 pt-8 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-[#4cd7f6]/20">
                <KeyRound className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-[#dae2fd]">
                  New Password
                </CardTitle>
                <CardDescription className="text-[#c7c4d7] text-xs">
                  Set a new password
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-8">
            {success ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-16 w-16 text-[#10b981] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#dae2fd] mb-2">Success!</h3>
                <p className="text-sm text-[#c7c4d7]">Redirecting to login...</p>
              </div>
            ) : !ready ? (
              <div className="text-center py-6">
                <AlertCircle className="h-16 w-16 text-[#f59e0b] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#dae2fd] mb-2">
                  Click the link in your email
                </h3>
                <p className="text-sm text-[#c7c4d7] mb-6">
                  Waiting for password reset link...
                </p>
                <Button asChild className="primary-gradient text-white font-bold">
                  <Link href="/forgot-password">Request New Link</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-10 pr-10 bg-[#0b1326] border-[#464554]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#908fa0]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                    Confirm
                  </Label>
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 bg-[#0b1326] border-[#464554]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 primary-gradient text-white font-bold"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
