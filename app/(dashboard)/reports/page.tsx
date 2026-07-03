
import { getCurrentShop } from '@/lib/db'
import { ReportsView } from '@/components/reports/reports-view'

export default async function ReportsPage() {
  const shop = await getCurrentShop()
  if (!shop) return null
  return <ReportsView shopId={shop.id} />
}
