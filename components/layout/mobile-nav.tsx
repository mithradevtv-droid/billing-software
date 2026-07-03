'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Users, Package, BarChart3 } from 'lucide-react'

const items = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/billing', icon: Receipt, label: 'Bill' },
  { href: '/customers', icon: Users, label: 'Cust' },
  { href: '/products', icon: Package, label: 'Stock' },
  { href: '/reports', icon: BarChart3, label: 'Tax' },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#060e20]/95 backdrop-blur-xl border-t border-[#464554] z-50 slide-in-right">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                active ? 'text-[#4cd7f6]' : 'text-[#c7c4d7]'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-[#4cd7f6] to-transparent" />
              )}
              <item.icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : 'scale-100'}`} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
