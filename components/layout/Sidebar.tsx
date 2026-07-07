'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ReceiptText,
  Truck,
  ShoppingBag,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/billing', label: 'New Bill', icon: Receipt },
  { href: '/invoices', label: 'Invoices', icon: ReceiptText },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/products', label: 'Inventory', icon: Package },
  { href: '/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/purchases', label: 'Purchases', icon: ShoppingBag },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-[#464554] bg-[#060e20] h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-[#464554]">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg primary-gradient flex items-center justify-center shadow-lg">
              <ReceiptText className="h-5 w-5 text-white" />
            </div>

            {!collapsed && (
              <div className={mounted ? 'slide-in-left' : 'opacity-0'}>
                <h1
                  className="font-bold text-base text-[#dae2fd]"
                  style={{ fontFamily: 'var(--font-sora)' }}
                >
                  BillMate Pro
                </h1>

                <p className="text-[9px] text-[#c7c4d7] uppercase tracking-widest font-medium">
                  GST Billing System
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#c7c4d7] hover:text-white"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${
                collapsed ? 'justify-center' : 'gap-3'
              } px-3 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-[#03b5d3] to-[#4cd7f6] text-[#003640]'
                  : 'text-[#c7c4d7] hover:bg-[#171f33] hover:text-[#dae2fd]'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />

              {!collapsed && (
                <span>{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#464554]">
        <button
          onClick={logout}
          className="w-full primary-gradient text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
        >
          <LogOut className="h-4 w-4" />

          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}