import { getCurrentShop, getInvoicesWithPayments, getPayments, getPaymentStats, getPaymentMethodsBreakdown } from '@/lib/db'
import { PaymentsView } from '@/components/payments/payments-view'

export default async function PaymentsPage() {
  const shop = await getCurrentShop()
  if (!shop) return null

  const [invoices, payments, stats, methodsBreakdown] = await Promise.all([
    getInvoicesWithPayments(shop.id),
    getPayments(shop.id, { limit: 50 }),
    getPaymentStats(shop.id),
    getPaymentMethodsBreakdown(shop.id, 30)  // Last 30 days
  ])

  const pendingInvoices = invoices.filter((inv: any) => inv.outstanding_amount > 0)

  return (
    <PaymentsView
      invoices={invoices}
      pendingInvoices={pendingInvoices}
      payments={payments}
      stats={stats}
      methodsBreakdown={methodsBreakdown}
      shopId={shop.id}
    />
  )
}
