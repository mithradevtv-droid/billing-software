'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { format, subDays, startOfDay } from 'date-fns'

export function SalesChart({ shopId }: { shopId: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const days = 12
      const startDate = startOfDay(subDays(new Date(), days - 1)).toISOString()

      const { data: invoices } = await supabase
        .from('invoices')
        .select('total, created_at')
        .eq('shop_id', shopId)
        .gte('created_at', startDate)
        .order('created_at')

      const grouped: Record<string, number> = {}
      for (let i = 0; i < days; i++) {
        const d = format(subDays(new Date(), days - 1 - i), 'dd MMM')
        grouped[d] = 0
      }

      invoices?.forEach(inv => {
        const day = format(new Date(inv.created_at), 'dd MMM')
        if (grouped[day] !== undefined) {
          grouped[day] += Number(inv.total)
        }
      })

      setData(Object.entries(grouped).map(([day, total]) => ({ day, total })))
      setLoading(false)
    }
    loadData()
  }, [shopId])

  return (
    <Card className="midnight-card border-[#464554]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-[#464554]">
        <div>
          <CardTitle className="text-base font-bold text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
            Sales Movement
          </CardTitle>
          <p className="text-xs text-[#c7c4d7] mt-0.5">Last 12 days</p>
        </div>
        <Badge variant="outline" className="border-[#10b981] text-[#10b981] gap-1.5 bg-[#10b981]/10">
          <span className="h-2 w-2 rounded-full bg-[#10b981] pulse-alert" />
          Live
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-[#4cd7f6] rounded-full loading-dot" />
              <div className="w-2 h-2 bg-[#4cd7f6] rounded-full loading-dot" />
              <div className="w-2 h-2 bg-[#4cd7f6] rounded-full loading-dot" />
            </div>
          </div>
        ) : (
          <div className="h-[280px] w-full fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4cd7f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4cd7f6" stopOpacity={0} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#2d3449" 
                  vertical={false}
                  className="opacity-30"
                />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: '#908fa0' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#908fa0' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ stroke: '#4cd7f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#171f33',
                    border: '1px solid #464554',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                  labelStyle={{ color: '#dae2fd', fontWeight: 600 }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#4cd7f6"
                  strokeWidth={2.5}
                  fill="url(#colorSales)"
                  filter="url(#glow)"
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
