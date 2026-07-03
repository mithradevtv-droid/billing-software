import { getCurrentShop, getCustomers } from '@/lib/db'
import { CustomersView } from '@/components/customers/customers-view'

export default async function CustomersPage() {
  const shop = await getCurrentShop()
  if (!shop) return null
  const customers = await getCustomers(shop.id)
  return <CustomersView initialCustomers={customers} shopId={shop.id} />
}
