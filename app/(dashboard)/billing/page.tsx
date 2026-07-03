import { BillingTerminal } from '@/components/billing/billing-terminal'
import { getCurrentShop, getProducts, getCustomers } from '@/lib/db'

export default async function BillingPage() {
  const shop = await getCurrentShop()
  if (!shop) return null

  const [products, customers] = await Promise.all([
    getProducts(shop.id),
    getCustomers(shop.id),
  ])

  return (
    <BillingTerminal
      shop={shop}
      initialProducts={products}
      initialCustomers={customers}
    />
  )
}
