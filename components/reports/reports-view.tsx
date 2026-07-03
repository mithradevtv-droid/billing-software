import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, Download, TrendingUp, TrendingDown,
  Calendar, IndianRupee, Receipt, Users, Package,
  ChevronRight, BarChart3, Calculator
} from 'lucide-react'
import { formatCurrency } from '@/lib/gst-calculator'
import { createClient } from '@/lib/supabase/server'
import { format, subDays, startOfDay } from 'date-fns'

export async function ReportsView({ shopId }: { shopId: string }) {
  const supabase = await createClient()
  
  // Date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const last7Days = subDays(now, 7).toISOString()
  
  // Fetch all data in parallel
  const [
    { data: monthInvoices },
    { data: lastMonthInvoices },
    { data: weekInvoices },
    { data: allInvoices },
    { data: customers },
    { data: products }
  ] = await Promise.all([
    supabase.from('invoices').select('*').eq('shop_id', shopId).gte('created_at', startOfMonth),
    supabase.from('invoices').select('total').eq('shop_id', shopId).gte('created_at', startOfLastMonth).lt('created_at', startOfMonth),
    supabase.from('invoices').select('*').eq('shop_id', shopId).gte('created_at', last7Days),
    supabase.from('invoices').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(50),
    supabase.from('customers').select('id, name, total_sales').eq('shop_id', shopId).order('total_sales', { ascending: false }).limit(5),
    supabase.from('products').select('id, name, current_stock, selling_price').eq('shop_id', shopId).eq('active', true),
  ])

  // Calculate metrics
  const totalRevenue = monthInvoices?.reduce((s, i) => s + Number(i.total), 0) || 0
  const totalTax = monthInvoices?.reduce((s, i) => s + Number(i.cgst || 0) + Number(i.sgst || 0) + Number(i.igst || 0), 0) || 0
  const invoiceCount = monthInvoices?.length || 0
  const avgInvoice = invoiceCount > 0 ? totalRevenue / invoiceCount : 0
  const paidInvoices = monthInvoices?.filter(i => i.status === 'Paid') || []
  const unpaidInvoices = monthInvoices?.filter(i => i.status === 'Unpaid') || []
  const paidAmount = paidInvoices.reduce((s, i) => s + Number(i.total), 0)
  const unpaidAmount = unpaidInvoices.reduce((s, i) => s + Number(i.total), 0)

  // Last 7 days chart data
  const chartData = []
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(subDays(now, i))
    const dayEnd = new Date(day.getTime() + 86400000)
    const dayInvoices = weekInvoices?.filter(inv => {
      const d = new Date(inv.created_at)
      return d >= day && d < dayEnd
    }) || []
    const total = dayInvoices.reduce((s, i) => s + Number(i.total), 0)
    chartData.push({
      day: format(day, 'EEE'),
      date: format(day, 'dd MMM'),
      total,
      count: dayInvoices.length,
    })
  }
  
  const maxChartValue = Math.max(...chartData.map(d => d.total), 1)

  // Top products (from invoices)
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
  allInvoices?.forEach(inv => {
    // Would need to query invoice_items for this - simplified
  })

  // GST summary
  const cgstTotal = monthInvoices?.reduce((s, i) => s + Number(i.cgst || 0), 0) || 0
  const sgstTotal = monthInvoices?.reduce((s, i) => s + Number(i.sgst || 0), 0) || 0
  const igstTotal = monthInvoices?.reduce((s, i) => s + Number(i.igst || 0), 0) || 0

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#dae2fd]">
            Reports & Analytics
          </h1>
          <p className="text-sm text-[#c7c4d7]">
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#464554] text-[#c7c4d7] hover:border-[#4cd7f6]">
            <Calendar className="mr-2 h-4 w-4" /> This Month
          </Button>
          <Button className="primary-gradient text-white font-bold">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 stagger">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={IndianRupee}
          iconBg="bg-[#4cd7f6]/10"
          iconColor="text-[#4cd7f6]"
        />
        <KPICard
          title="Invoices"
          value={invoiceCount.toString()}
          icon={Receipt}
          iconBg="bg-[#8083ff]/10"
          iconColor="text-[#8083ff]"
        />
        <KPICard
          title="GST Collected"
          value={formatCurrency(totalTax)}
          icon={Calculator}
          iconBg="bg-[#10b981]/10"
          iconColor="text-[#10b981]"
        />
        <KPICard
          title="Avg Invoice"
          value={formatCurrency(avgInvoice)}
          icon={TrendingUp}
          iconBg="bg-[#f59e0b]/10"
          iconColor="text-[#f59e0b]"
        />
      </div>

      {/* Sales Chart */}
      <Card className="midnight-card border-[#464554]">
        <CardHeader className="border-b border-[#464554]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#dae2fd]">
                Last 7 Days
              </CardTitle>
              <p className="text-xs text-[#c7c4d7]">Daily sales breakdown</p>
            </div>
            <Badge variant="outline" className="border-[#4cd7f6] text-[#4cd7f6] bg-[#4cd7f6]/10">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {chartData.map((day, idx) => (
              <div key={idx} className="flex items-center gap-4 animate-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="w-16 shrink-0">
                  <p className="text-xs font-bold text-[#dae2fd]">{day.day}</p>
                  <p className="text-[10px] text-[#908fa0]">{day.date}</p>
                </div>
                <div className="flex-1 h-8 bg-[#0b1326] rounded-md overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4cd7f6] to-[#8083ff] rounded-md transition-all duration-1000"
                    style={{ 
                      width: `${(day.total / maxChartValue) * 100}%`,
                      boxShadow: day.total > 0 ? '0 0 12px rgba(76, 215, 246, 0.3)' : 'none'
                    }}
                  />
                </div>
                <div className="w-32 text-right shrink-0">
                  <p className="font-mono font-bold text-sm text-[#dae2fd] tabular-nums">
                    {formatCurrency(day.total)}
                  </p>
                  <p className="text-[10px] text-[#908fa0]">
                    {day.count} {day.count === 1 ? 'invoice' : 'invoices'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* GST + Payment Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* GST Summary */}
        <Card className="midnight-card border-[#464554]">
          <CardHeader className="border-b border-[#464554]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-[#4cd7f6]" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#dae2fd]">
                  GST Filing Summary
                </CardTitle>
                <p className="text-xs text-[#c7c4d7]">Current month breakdown</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {totalTax === 0 ? (
              <p className="text-center text-sm text-[#908fa0] py-4">
                No GST collected this month
              </p>
            ) : (
              <>
                <GSTRow label="CGST" value={cgstTotal} color="bg-[#8083ff]" max={totalTax} />
                <GSTRow label="SGST" value={sgstTotal} color="bg-[#4cd7f6]" max={totalTax} />
                <GSTRow label="IGST" value={igstTotal} color="bg-[#c0c1ff]" max={totalTax} />
                <div className="pt-3 mt-3 border-t border-[#464554] flex justify-between items-center">
                  <span className="font-bold text-sm text-[#dae2fd]">Total Tax</span>
          <span className="font-bold text-xl text-[#10b981] tabular-nums">
            {formatCurrency(totalTax)}
          </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="midnight-card border-[#464554]">
          <CardHeader className="border-b border-[#464554]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-[#10b981]" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#dae2fd]">
                  Payment Status
                </CardTitle>
                <p className="text-xs text-[#c7c4d7]">Receivables breakdown</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <PaymentRow 
              label="Paid" 
              value={paidAmount} 
              count={paidInvoices.length} 
              color="bg-[#10b981]" 
              textColor="text-[#10b981]" 
            />
            <PaymentRow 
              label="Unpaid" 
              value={unpaidAmount} 
              count={unpaidInvoices.length} 
              color="bg-[#ef4444]" 
              textColor="text-[#ef4444]" 
            />
            <div className="pt-3 mt-3 border-t border-[#464554] flex justify-between items-center">
              <span className="font-bold text-sm text-[#dae2fd]">Total</span>
              <span className="font-bold text-xl text-[#dae2fd] tabular-nums">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card className="midnight-card border-[#464554]">
        <CardHeader className="border-b border-[#464554]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#8083ff]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#8083ff]" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#dae2fd]">
                  Top Customers
                </CardTitle>
                <p className="text-xs text-[#c7c4d7]">By total purchase value</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!customers || customers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30 text-[#908fa0]" />
              <p className="text-sm text-[#908fa0]">No customer data yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[#464554]">
              {customers.map((customer, idx) => (
                <div 
                  key={customer.id} 
                  className="flex items-center justify-between p-4 hover:bg-[#222a3d] transition-colors animate-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#8083ff] to-[#4cd7f6] flex items-center justify-center text-white font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#dae2fd]">{customer.name}</p>
                      <p className="text-xs text-[#908fa0]">Customer #{idx + 1}</p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-sm text-[#10b981] tabular-nums">
                    {formatCurrency(Number(customer.total_sales || 0))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Components
function KPICard({ title, value, icon: Icon, iconBg, iconColor }: any) {
  return (
    <div className="midnight-card rounded-xl p-5 transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[10px] text-[#908fa0] font-bold uppercase tracking-widest">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-[#dae2fd] tabular-nums truncate">
            {value}
          </p>
        </div>
        <div className={`h-11 w-11 rounded-lg ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function GSTRow({ label, value, color, max }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-[#c7c4d7]">{label}</span>
        <span className="font-mono text-[#dae2fd] font-medium tabular-nums">
          {formatCurrency(value)}
        </span>
      </div>
      <div className="h-1.5 bg-[#2d3449] rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  )
}

function PaymentRow({ label, value, count, color, textColor }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#0b1326] rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <div>
          <p className={`text-sm font-bold ${textColor}`}>{label}</p>
          <p className="text-xs text-[#908fa0]">{count} {count === 1 ? 'invoice' : 'invoices'}</p>
        </div>
      </div>
      <p className={`font-mono font-bold ${textColor} tabular-nums`}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}
