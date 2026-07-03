'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Receipt, Users, Package, BarChart3, 
  Settings, LogOut, ReceiptText 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/billing', label: 'New Bill', icon: Receipt },
  { href: '/invoices', label: 'Invoices', icon: ReceiptText },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/products', label: 'Inventory', icon: Package },
  { href: '/reports', label: 'GST Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#464554] bg-[#060e20] h-screen sticky top-0">
      <div className="p-6 border-b border-[#464554]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-lg primary-gradient flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
            <ReceiptText className="h-5 w-5 text-white" />
          </div>
          <div className={mounted ? 'slide-in-left' : 'opacity-0'}>
            <h1 className="font-bold text-base text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
              BillMate Pro
            </h1>
            <p className="text-[9px] text-[#c7c4d7] uppercase tracking-widest font-medium">
              GST Compliance Suite
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 stagger">
        {nav.map((item, idx) => {
          const active = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden ${
                active
                  ? 'bg-gradient-to-r from-[#03b5d3] to-[#4cd7f6] text-[#003640] shadow-lg shadow-[#4cd7f6]/30'
                  : 'text-[#c7c4d7] hover:bg-[#171f33] hover:text-[#dae2fd] hover:translate-x-1'
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {active && (
                <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              )}
              <Icon className={`h-4 w-4 relative z-10 transition-transform group-hover:scale-110 ${active ? '' : 'group-hover:rotate-12'}`} />
              <span className="relative z-10">{item.label}</span>
              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white pulse-alert relative z-10" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#464554] space-y-2">
        <button className="w-full primary-gradient text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-sm">
          <Receipt className="h-4 w-4" />
          Quick Scan
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#c7c4d7] hover:bg-[#171f33] hover:text-[#ef4444] transition-all duration-300 group"
        >
          <LogOut className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
