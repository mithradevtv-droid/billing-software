import { getCurrentShop, getSuppliers } from '@/lib/db'
import { SuppliersView } from '@/components/suppliers/suppliers-view'

export default async function SuppliersPage() {
  const shop = await getCurrentShop()

  if (!shop) return null

  const suppliers = await getSuppliers(shop.id)

  return (
    <SuppliersView
      suppliers={suppliers}
      shopId={shop.id}
    />
  )
}