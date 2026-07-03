'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Loader2, Mail, ArrowLeft, ArrowRight, 
  KeyRound, CheckCircle2, Receipt, Sparkles
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const supabase = createClient()
      
      // ⚠️ IMPORTANT: redirectTo must match your URL
      const redirectUrl = `${window.location.origin}/reset-password`
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        console.error('Reset password error:', error)
        throw error
      }

      setSent(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      console.error('Error:', err)
      toast.error(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      {/* LEFT SIDE - HERO */}
      <section className="relative hidden md:flex md:w-7/12 lg:w-3/5 bg-[#0b1326] overflow-hidden items-center px-10 lg:px-12">
        <div className="absolute inset-0 technical-grid opacity-30" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#8083ff]/10 blur-[120px] rounded-full float" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4cd7f6]/5 blur-[150px] rounded-full float" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 max-w-2xl">
          <div className={`mb-12 ${mounted ? 'slide-in-left' : 'opacity-0'}`}>
            <span className="font-bold text-2xl gradient-text">BillMate</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
            Forgot your{' '}
            <span className="gradient-text">password?</span>
          </h1>
          
          <p className="text-lg text-[#c7c4d7] max-w-lg mb-12 leading-relaxed fade-in" style={{ animationDelay: '0.4s' }}>
            No worries! Enter your email and we'll send you 
            instructions to reset your password.
          </p>

          {/* Steps */}
          <div className="space-y-4 fade-in" style={{ animationDelay: '0.6s' }}>
            <StepItem number="1" text="Enter your registered email" />
            <StepItem number="2" text="Check your inbox for reset link" />
            <StepItem number="3" text="Create a new secure password" />
            <StepItem number="4" text="Login with your new password" />
          </div>
        </div>
      </section>

      {/* RIGHT SIDE - FORM */}
      <section className="flex-1 bg-[#060e20] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 text-center">
            <span className="font-bold text-2xl gradient-text">BillMate</span>
          </div>

          <Card className={`w-full midnight-card border-[#464554] ${mounted ? 'modal-pop' : 'opacity-0'}`}>
            <CardHeader className="space-y-3 pt-8 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-[#4cd7f6]/20">
                  <KeyRound className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#dae2fd]">
                    Reset Password
                  </CardTitle>
                  <CardDescription className="text-[#c7c4d7] text-xs">
                    We'll send you a reset link
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-8">
              {sent ? (
                // ✅ SUCCESS STATE
                <div className="text-center py-6 animate-in">
                  <div className="h-16 w-16 rounded-full bg-[#10b981]/10 border-2 border-[#10b981] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-[#10b981]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#dae2fd] mb-2">
                    Check your email!
                  </h3>
                  <p className="text-sm text-[#c7c4d7] mb-2">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-mono font-bold text-[#4cd7f6] mb-6 inline-block break-all">
                    {email}
                  </p>
                  <p className="text-xs text-[#908fa0] mb-6">
                    Didn't get it? Check spam folder or wait a few minutes.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => setSent(false)}
                      variant="outline"
                      className="w-full border-[#464554] text-[#c7c4d7] hover:bg-[#171f33]"
                    >
                      Send Another Email
                    </Button>
                    <Button asChild variant="ghost" className="w-full text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33]">
                      <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                // 📝 FORM STATE
                <>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0] group-focus-within:text-[#4cd7f6] transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 pl-10 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] focus:ring-[#4cd7f6] focus:shadow-lg focus:shadow-[#4cd7f6]/20 transition-all"
                        />
                      </div>
                      <p className="text-xs text-[#908fa0] mt-2">
                        We'll email you a link to reset your password
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 primary-gradient text-white font-bold uppercase tracking-wider text-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-[#464554] text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-sm text-[#4cd7f6] hover:underline hover:scale-105 transition-transform"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

function StepItem({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="h-8 w-8 rounded-full bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 flex items-center justify-center text-[#4cd7f6] font-bold text-sm group-hover:scale-110 transition-transform">
        {number}
      </div>
      <span className="text-sm text-[#dae2fd] font-medium">{text}</span>
    </div>
  )
}
