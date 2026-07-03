import { createClient } from '@/lib/supabase/server'
import { Search, Bell, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const initials = (user.email?.[0] || 'U').toUpperCase()
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-40 bg-[#0b1326]/70 backdrop-blur-xl border-b border-[#464554] animate-in">
      <div className="flex items-center justify-between p-4 gap-4">
        <div className="hidden md:flex items-center gap-3 text-sm text-[#c7c4d7] slide-in-left">
          <span className="font-medium">{today}</span>
          <Badge variant="outline" className="border-[#4cd7f6] text-[#4cd7f6] gap-1 bg-[#4cd7f6]/10">
            <Sparkles className="h-3 w-3" />
            Live
          </Badge>
        </div>

        <div className="flex-1 max-w-md relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0] group-focus-within:text-[#4cd7f6] transition-colors" />
          <input
            placeholder="Search invoices, customers..."
            className="w-full bg-[#171f33] border border-[#464554] rounded-lg pl-10 pr-4 py-2 text-sm text-[#dae2fd] placeholder:text-[#908fa0] focus:ring-1 focus:ring-[#4cd7f6] focus:border-[#4cd7f6] outline-none transition-all duration-300 focus:shadow-lg focus:shadow-[#4cd7f6]/20"
          />
        </div>

        <div className="flex items-center gap-3 slide-in-right">
          <button className="relative p-2 rounded-lg hover:bg-[#171f33] text-[#c7c4d7] hover:text-[#4cd7f6] transition-all duration-300 scale-on-hover">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#ef4444] pulse-alert" />
          </button>
          <Avatar className="h-9 w-9 border border-[#464554] hover:border-[#4cd7f6] transition-colors cursor-pointer hover:scale-110 transition-transform">
            <AvatarFallback className="bg-gradient-to-br from-[#8083ff] to-[#4cd7f6] text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
