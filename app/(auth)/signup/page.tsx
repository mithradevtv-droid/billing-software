'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Loader2, ArrowRight, User, Lock, 
  Mail, Store, MapPin, Sparkles, Building2
} from 'lucide-react'
import { INDIAN_STATES } from '@/lib/gst-calculator'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(true)
  const [state, setState] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!state) {
      toast.error('Please select your state')
      return
    }

    setLoading(true)
    const fd = new FormData(e.currentTarget)
    
    const shopName = fd.get('shopName') as string
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    const address = fd.get('address') as string

    try {
      const supabase = createClient()
      
      
      // 1. Sign up the user (auth metadata includes shop info)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            shop_name: shopName,
            shop_state: state,
            shop_address: address || '',
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed - no user created')

      // 2. Wait a moment for auth to complete
      await new Promise(resolve => setTimeout(resolve, 500))

      // 3. Create the shop manually (in case trigger didn't fire)
      const { error: shopError } = await supabase
        .from('shops')
        .insert({
          owner_id: authData.user.id,
          name: shopName,
          state: state,
          address: address || null,
          invoice_prefix: 'INV',
          next_invoice_number: 1,
          default_tax_rate: 18,
          currency: 'INR',
        })
        .select()
        .single()

      // Ignore duplicate error if trigger already created it
      if (shopError && !shopError.message.includes('duplicate')) {
        console.warn('Shop creation warning:', shopError)
      }

      toast.success('Account created! Welcome to BillMate 🎉')
      
      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      router.push('/')
      router.refresh()
    } catch (err: any) {
      console.error('Signup error:', err)
      toast.error(err.message || 'Failed to create account')
    } finally {
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
          <div className="mb-12">
            <span className="font-bold text-2xl gradient-text">
              BillMate
            </span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl font-bold leading-tight mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
            Start billing in{' '}
            <span className="gradient-text">minutes.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg text-[#c7c4d7] max-w-lg mb-12 leading-relaxed fade-in" style={{ animationDelay: '0.4s' }}>
            Professional GST billing for small shops. 
            Secure, compliant, and built for speed.
          </p>
          
          {/* Feature Highlights */}
          <div className="space-y-3 fade-in" style={{ animationDelay: '0.6s' }}>
            <FeatureItem text="Free forever for small shops" />
            <FeatureItem text="GST-compliant invoices" />
            <FeatureItem text="Multi-device, cloud sync" />
            <FeatureItem text="Inventory & customer tracking" />
          </div>
        </div>
      </section>

      {/* RIGHT SIDE - FORM */}
      <section className="flex-1 bg-[#060e20] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="md:hidden mb-8 text-center">
            <span className="font-bold text-2xl gradient-text">BillMate</span>
          </div>

          {/* Signup Card */}
          <Card className="w-full midnight-card border-[#464554] modal-pop">
            <CardHeader className="space-y-3 pt-8 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-[#4cd7f6]/20">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#dae2fd]">
                    Create account
                  </CardTitle>
                  <CardDescription className="text-[#c7c4d7] text-xs">
                    Start your free BillMate journey
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-8">
              <form onSubmit={onSubmit} className="space-y-3">
                {/* Shop Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="shopName" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                    Shop Name *
                  </Label>
                  <div className="relative group">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0] group-focus-within:text-[#4cd7f6] transition-colors" />
                    <Input 
                      id="shopName" 
                      name="shopName" 
                      placeholder="Sharma Kirana Store" 
                      required 
                      minLength={2}
                      className="h-11 pl-10 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] focus:ring-[#4cd7f6] transition-all" 
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                    Email *
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0] group-focus-within:text-[#4cd7f6] transition-colors" />
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      required 
                      className="h-11 pl-10 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] focus:ring-[#4cd7f6] transition-all" 
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                    Password *
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0] group-focus-within:text-[#4cd7f6] transition-colors" />
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="Min 6 characters"
                      required 
                      minLength={6}
                      className="h-11 pl-10 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] focus:ring-[#4cd7f6] transition-all" 
                    />
                  </div>
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                    State *
                  </Label>
                  <Select value={state} onValueChange={setState} required>
                    <SelectTrigger className="h-11 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#171f33] border-[#464554] max-h-[250px]">
                      {INDIAN_STATES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address (optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider">
                    Address (optional)
                  </Label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0] group-focus-within:text-[#4cd7f6] transition-colors" />
                    <Input 
                      id="address" 
                      name="address" 
                      placeholder="City, Area" 
                      className="h-11 pl-10 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] focus:ring-[#4cd7f6] transition-all" 
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 primary-gradient text-white font-bold uppercase tracking-wider text-sm mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="mt-6 pt-6 border-t border-[#464554] text-center">
                <p className="text-sm text-[#c7c4d7]">
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="text-[#4cd7f6] font-bold hover:underline hover:scale-105 inline-block transition-transform"
                  >
                    Sign in →
                  </Link>
                </p>
              </div>

              {/* Trust badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#908fa0]">
                <Sparkles className="h-3 w-3" />
                <span>Free forever • No credit card required</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

// Feature Item Component
function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="h-6 w-6 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
        <svg 
          className="h-3 w-3 text-[#10b981]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-sm text-[#dae2fd] font-medium">{text}</span>
    </div>
  )
}
