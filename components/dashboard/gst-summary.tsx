import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator } from 'lucide-react'
import { formatCurrency } from '@/lib/gst-calculator'
import { createClient } from '@/lib/supabase/server'

export async function GSTSummary({ shopId }: { shopId: string }) {
  const supabase = await createClient()
  
  // Get start of current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
  
  // Query real invoices for this month
  const { data: invoices } = await supabase
    .from('invoices')
    .select('cgst, sgst, igst, total')
    .eq('shop_id', shopId)
    .gte('created_at', startOfMonth)
  
  // Calculate totals from real data
  const igstTotal = invoices?.reduce((sum, inv) => sum + Number(inv.igst || 0), 0) || 0
  const cgstTotal = invoices?.reduce((sum, inv) => sum + Number(inv.cgst || 0), 0) || 0
  const sgstTotal = invoices?.reduce((sum, inv) => sum + Number(inv.sgst || 0), 0) || 0
  const totalTax = igstTotal + cgstTotal + sgstTotal
  
  // Calculate max for progress bar
  const maxTax = Math.max(igstTotal, cgstTotal, sgstTotal, 1)

  const items = [
    { label: 'IGST', value: igstTotal, color: 'bg-[#4cd7f6]' },
    { label: 'CGST', value: cgstTotal, color: 'bg-[#8083ff]' },
    { label: 'SGST', value: sgstTotal, color: 'bg-[#c0c1ff]' },
  ]

  // Next filing date (20th of next month)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 20)
  const nextFiling = nextMonth.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <Card className="midnight-card border-[#464554]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center">
            <Calculator className="h-5 w-5 text-[#4cd7f6]" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-[#dae2fd]">
              GST Summary
            </CardTitle>
            <p className="text-xs text-[#c7c4d7]">This month</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalTax === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#908fa0]">No GST data yet</p>
            <p className="text-xs text-[#908fa0] mt-1">Create invoices to see GST breakdown</p>
          </div>
        ) : (
          <>
            {items.map((item, idx) => (
              <div key={item.label} className="animate-in" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#c7c4d7]">{item.label}</span>
                  <span className="font-mono text-[#dae2fd] font-medium tabular-nums">
                    {formatCurrency(item.value)}
                  </span>
                </div>
                <div className="h-1.5 bg-[#2d3449] rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full progress-animated`}
                    style={{ width: `${(item.value / maxTax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-4 mt-4 border-t border-[#464554] flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c7c4d7]">
                Total Tax
              </span>
              <span className="font-bold text-lg text-[#10b981] tabular-nums">
                {formatCurrency(totalTax)}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-[#908fa0]">Next Filing</span>
              <span className="font-mono text-[#4cd7f6]">{nextFiling}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
