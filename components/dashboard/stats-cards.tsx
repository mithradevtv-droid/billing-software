import { Card, CardContent } from '@/components/ui/card'
import { 
  TrendingUp, TrendingDown, IndianRupee, Wallet, 
  Calculator, Boxes, Receipt 
} from 'lucide-react'
import { AnimatedCounter } from './animated-counter'

export function StatsCards({ stats }: { stats: any }) {
  const cards = [
    {
      title: "Today's Sales",
      value: stats.todaySales,
      format: 'currency',
      subtext: `${stats.todayCount} bills`,
      icon: IndianRupee,
      gradient: 'from-[#4cd7f6]/10 to-transparent',
      iconBg: 'bg-[#4cd7f6]/10',
      iconColor: 'text-[#4cd7f6]',
      trend: '+12.5%',
      up: true,
    },
    {
      title: 'This Month',
      value: stats.monthSales,
      format: 'currency',
      subtext: `${stats.monthCount} bills`,
      icon: Wallet,
      gradient: 'from-[#8083ff]/10 to-transparent',
      iconBg: 'bg-[#8083ff]/10',
      iconColor: 'text-[#8083ff]',
      trend: '+8.2%',
      up: true,
    },
    {
      title: 'GST Estimate',
      value: Math.round(stats.monthSales * 0.18),
      format: 'currency',
      subtext: '18% rate',
      icon: Calculator,
      gradient: 'from-[#bcc7de]/10 to-transparent',
      iconBg: 'bg-[#bcc7de]/10',
      iconColor: 'text-[#bcc7de]',
      trend: 'Estimated',
      up: true,
    },
    {
      title: 'Low Stock',
      value: stats.lowStockCount,
      format: 'number',
      subtext: 'SKUs need restock',
      icon: Boxes,
      gradient: 'from-[#ef4444]/10 to-transparent',
      iconBg: 'bg-[#ef4444]/10',
      iconColor: 'text-[#ef4444]',
      trend: stats.lowStockCount > 0 ? 'Alert' : 'All good',
      up: stats.lowStockCount === 0,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 stagger">
      {cards.map((c, idx) => {
        const Icon = c.icon
        return (
          <div 
            key={c.title} 
            className="midnight-card rounded-xl p-5 relative overflow-hidden group cursor-pointer"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-[10px] text-[#908fa0] font-bold uppercase tracking-widest">
                  {c.title}
                </p>
                <p className="text-2xl font-bold tracking-tight text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
                  <AnimatedCounter 
                    value={c.value} 
                    prefix={c.format === 'currency' ? '₹' : ''}
                  />
                </p>
                <div className="flex items-center gap-1 pt-1">
                  {c.up ? (
                    <TrendingUp className="h-3 w-3 text-[#10b981] scale-on-hover" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-[#f59e0b] pulse-alert" />
                  )}
                  <span className={`text-xs font-bold ${c.up ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                    {c.trend}
                  </span>
                </div>
                <p className="text-xs text-[#c7c4d7] truncate">{c.subtext}</p>
              </div>
              <div className={`h-11 w-11 rounded-lg ${c.iconBg} flex items-center justify-center ${c.iconColor} group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
