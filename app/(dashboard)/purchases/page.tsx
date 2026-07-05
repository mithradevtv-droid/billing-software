import { PurchasesView } from '@/components/purchases/purchases-view'
import {
  getCurrentShop,
  getProducts,
  getSuppliers,
   getPurchases,
} from '@/lib/db'

export default async function PurchasesPage() {
  const shop = await getCurrentShop()

  if (!shop) return null

  const products = await getProducts(shop.id)
  const suppliers = await getSuppliers(shop.id)
  const purchases = await getPurchases(shop.id)
  return (
    <PurchasesView
      shopId={shop.id}
      products={products}
      suppliers={suppliers}
      purchases={purchases}
    />
  )
}