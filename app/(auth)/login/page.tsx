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
  Mail, Lock, ArrowRight, Loader2, 
  Receipt, Sparkles, Shield, Eye, EyeOff
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    // Check if already logged in
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/')
      router.refresh()
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email first')
        } else {
          toast.error(error.message)
        }
        setLoading(false)
        return
      }

      toast.success('Welcome back! 🎉')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      {/* LEFT SIDE - HERO */}
      <section className="relative hidden md:flex md:w-7/12 lg:w-3/5 bg-[#0b1326] overflow-hidden items-center px-10 lg:px-12">
        {/* Animated grid background */}
        <div className="absolute inset-0 technical-grid opacity-30" />
        
        {/* Floating gradient blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#8083ff]/10 blur-[120px] rounded-full float" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4cd7f6]/5 blur-[150px] rounded-full float" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 max-w-2xl">
          {/* Brand */}
          <div className={`mb-12 ${mounted ? 'slide-in-left' : 'opacity-0'}`}>
            <span className="font-bold text-2xl gradient-text">
              BillMate
            </span>
          </div>
          
          {/* Headline */}
          <h1 
            className={`text-5xl font-bold leading-tight mb-6 ${mounted ? 'fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s', fontFamily: 'var(--font-sora)' }}
          >
            Master your{' '}
            <span className="gradient-text">billing.</span>
          </h1>
          
          {/* Subheadline */}
          <p 
            className={`text-lg text-[#c7c4d7] max-w-lg mb-12 leading-relaxed ${mounted ? 'fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            Professional GST management for modern commerce. 
            Secure, compliant, and engineered for high-velocity finance teams.
          </p>
          
          {/* Compliance Health Card */}
          <div 
            className={`midnight-card border-[#464554] rounded-xl p-6 max-w-md ${mounted ? 'slide-in-left' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#10b981] rounded-full pulse-alert" />
                    <span className="text-xs font-bold text-[#c7c4d7] uppercase tracking-widest">
                      Compliance Health
                    </span>
                  </div>
                  <p className="text-sm text-[#908fa0]">Real-time audit status</p>
                </div>
                <div className="bg-[#10b981]/10 border border-[#10b981]/30 px-3 py-1 rounded-full glow-on-hover">
                  <span className="text-xs font-mono font-medium text-[#10b981] flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    99.8% Accurate
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">GST Filing Progress</span>
                  <span className="font-mono text-xs text-[#4cd7f6] font-bold">92%</span>
                </div>
                <div className="h-2 w-full bg-[#2d3449] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4cd7f6] to-[#8083ff] rounded-full progress-animated"
                    style={{ width: '92%', boxShadow: '0 0 12px rgba(76, 215, 246, 0.5)' }}
                  />
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-[#908fa0] uppercase tracking-wider font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Q3 Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE - FORM */}
      <section className="flex-1 bg-[#060e20] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="md:hidden mb-12 text-center">
            <span className="font-bold text-2xl gradient-text" style={{ fontFamily: 'var(--font-sora)' }}>
              BillMate
            </span>
            <h2 className="text-2xl font-bold mt-4 text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
              Welcome back
            </h2>
          </div>

          {/* Login Card */}
          <Card className={`w-full midnight-card border-[#464554] ${mounted ? 'modal-pop' : 'opacity-0'}`}>
            <CardHeader className="space-y-3 pt-8">
              <div className="hidden md:flex md:items-center gap-3">
                <div className="h-12 w-12 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-[#4cd7f6]/20">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
                    Welcome back
                  </CardTitle>
                  <CardDescription className="text-[#c7c4d7]">Sign in to continue</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-8">
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0] group-focus-within:text-[#4cd7f6] transition-colors" />
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      required 
                      autoComplete="email"
                      className="h-11 pl-10 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] focus:ring-[#4cd7f6] focus:shadow-lg focus:shadow-[#4cd7f6]/20 transition-all" 
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => window.location.href = "/forgot-password"}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0] group-focus-within:text-[#4cd7f6] transition-colors" />
                    <Input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required 
                      autoComplete="current-password"
                      className="h-11 pl-10 pr-10 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] focus:ring-[#4cd7f6] focus:shadow-lg focus:shadow-[#4cd7f6]/20 transition-all" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#908fa0] hover:text-[#4cd7f6] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-3">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#464554] bg-[#0b1326] text-[#4cd7f6] focus:ring-[#4cd7f6] focus:ring-offset-[#060e20] cursor-pointer"
                  />
                  <label 
                    htmlFor="remember" 
                    className="text-sm text-[#c7c4d7] cursor-pointer select-none"
                  >
                    Remember this device for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 primary-gradient text-white font-bold uppercase tracking-wider text-sm group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 pt-6 border-t border-[#464554] text-center">
                <p className="text-sm text-[#c7c4d7]">
                  New here?{' '}
                  <Link 
                    href="/signup" 
                    className="text-[#4cd7f6] font-bold hover:underline hover:scale-105 inline-block transition-transform"
                  >
                    Create account →
                  </Link>
                </p>
              </div>

              {/* Forgot Password Link (mobile) */}
              <div className="md:hidden text-center mt-3">
                <Link 
                  href="/forgot-password"
                  className="text-xs text-[#c7c4d7] hover:text-[#4cd7f6]"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer info */}
          <p className="text-center text-[10px] text-[#908fa0] mt-6 flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Secured with Supabase Auth
          </p>
        </div>
      </section>
    </main>
  )
}
