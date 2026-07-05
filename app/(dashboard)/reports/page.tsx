import { getCurrentShop } from '@/lib/db'
import { ReportsView } from '@/components/reports/reports-view'

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string; startDate?: string; endDate?: string }>
}) {
  const shop = await getCurrentShop()
  if (!shop) return null

  const params = await searchParams
  const reportType = params.type || 'sales'
  
  // Default to last 30 days
  const endDate = params.endDate || new Date().toISOString().split('T')[0]
  const startDate = params.startDate || (() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })()

  return (
    <ReportsView
      shopId={shop.id}
      shop={shop}
      initialType={reportType}
      initialStartDate={startDate}
      initialEndDate={endDate}
    />
  )
}
