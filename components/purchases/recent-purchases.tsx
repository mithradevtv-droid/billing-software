import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowRight, Receipt, Plus } from 'lucide-react'
import Link from 'next/link'

interface RecentPurchasesProps {
  purchases: any[] | null | undefined
}

export function RecentPurchases({ purchases }: RecentPurchasesProps) {
  // 👇 SAFETY CHECK: Ensure it's always an array
  const safePurchases = Array.isArray(purchases) ? purchases : []

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'border-[#3ddc97] text-[#3ddc97] bg-[#3ddc97]/10'
      case 'pending':
        return 'border-[#ffce50] text-[#ffce50] bg-[#ffce50]/10'
      case 'partial':
        return 'border-[#4cd7f6] text-[#4cd7f6] bg-[#4cd7f6]/10'
      case 'cancelled':
        return 'border-red-400 text-red-400 bg-red-400/10'
      default:
        return 'border-[#464554] text-[#c7c4d7] bg-[#171f33]'
    }
  }

  function getTimeAgo(date: string) {
    if (!date) return ''
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
  }

  return (
    <Card className="bg-[#0e1421] border-[#171f33] fade-in h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-[#dae2fd] text-lg" style={{ fontFamily: 'var(--font-sora)' }}>
            <ShoppingCart className="h-5 w-5 text-[#4cd7f6]" />
            Recent Purchases
          </CardTitle>
          <p className="text-xs text-[#c7c4d7] mt-1">Latest 5 purchase orders</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-[#4cd7f6] hover:text-[#4cd7f6] hover:bg-[#4cd7f6]/10">
          <Link href="/purchases">
            VIEW ALL
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {safePurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-16 w-16 rounded-full bg-[#171f33] flex items-center justify-center mb-3">
              <Receipt className="h-8 w-8 text-[#464554]" />
            </div>
            <p className="text-sm text-[#c7c4d7]">No purchases yet</p>
            <p className="text-xs text-[#464554] mt-1">Add your first purchase order</p>
            <Button asChild className="mt-4 primary-gradient text-white uppercase text-xs font-bold tracking-wider">
              <Link href="/purchases">
                <Plus className="mr-2 h-4 w-4" /> Add Purchase
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {safePurchases.map((purchase, index) => (
              <Link
                key={purchase.id}
                href="/purchases"
                className="flex items-center justify-between rounded-lg border border-[#171f33] bg-[#0a0f1a]/50 p-3 transition-all hover:border-[#4cd7f6]/50 hover:bg-[#0e1421] group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-mono text-sm font-bold text-[#dae2fd] group-hover:text-[#4cd7f6] transition-colors">
                      {purchase.purchase_number}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${getStatusColor(purchase.status)}`}>
                      {purchase.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-sm text-[#c7c4d7] truncate">
                    {purchase.suppliers?.name || 'Unknown Supplier'}
                  </p>
                  <p className="text-xs text-[#464554] mt-0.5">
                    {getTimeAgo(purchase.purchase_date || purchase.created_at)}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="font-bold text-[#dae2fd] text-base">
                    {formatCurrency(purchase.total)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
