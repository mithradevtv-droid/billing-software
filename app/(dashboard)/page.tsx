import { getCurrentShop, getDashboardStats, getInvoices, getProducts,getRecentPurchases } from '@/lib/db'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { RecentInvoices } from '@/components/dashboard/recent-invoices'
import { GSTSummary } from '@/components/dashboard/gst-summary'
import { InventoryWatch } from '@/components/dashboard/inventory-watch'
import { RecentPurchases } from '@/components/purchases/recent-purchases'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import Link from 'next/link'


export default async function DashboardPage() {
  const shop = await getCurrentShop()
  if (!shop) return null
  
  const [stats, invoices, products, recentPurchases] = await Promise.all([
    getDashboardStats(shop.id),
    getInvoices(shop.id, { limit: 5 }),
    getProducts(shop.id),
    getRecentPurchases(shop.id, 5),
  ])

  const lowStock = products
    .filter(p => p.current_stock <= p.low_stock_threshold)
    .slice(0, 4)

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="fade-in">
          <p className="text-sm font-medium text-[#4cd7f6] uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight gradient-text" style={{ fontFamily: 'var(--font-sora)' }}>
            Billing Dashboard
          </h1>
          <p className="text-sm text-[#c7c4d7] mt-1">
            Welcome back, <span className="text-[#dae2fd] font-medium">{shop.name}</span>
          </p>
        </div>
        <div className="flex gap-2 slide-in-right">
          <Button asChild variant="outline" className="border-[#464554] text-[#dae2fd] hover:bg-[#171f33] hover:border-[#4cd7f6] hover:text-[#4cd7f6] uppercase text-xs font-bold tracking-wider">
            <Link href="/reports">
              <FileText className="mr-2 h-4 w-4" /> REPORTS
            </Link>
          </Button>
          <Button asChild className="primary-gradient text-white uppercase text-xs font-bold tracking-wider">
            <Link href="/billing">
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards with stagger */}
      <StatsCards stats={stats} />

      {/* Charts + GST */}
      <div className="grid gap-6 xl:grid-cols-3 stagger">
        <div className="xl:col-span-2">
          <SalesChart shopId={shop.id} />
        </div>
        <GSTSummary shopId={shop.id} />
      </div>

      {/* Recent Invoices + Inventory */}
      <div className="grid gap-6 xl:grid-cols-3 stagger">
        <div className="xl:col-span-2">
          <RecentInvoices invoices={invoices} />
        </div>
          <div className="xl:col-span-1">
          <RecentPurchases purchases={recentPurchases} />
         </div>
        <InventoryWatch products={lowStock} />
      </div>
    </div>
  )
}
