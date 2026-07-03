import { getCurrentShop, getInvoices } from '@/lib/db'
import { InvoicesTable } from '@/components/invoices/invoices-table'

export default async function InvoicesPage() {
  const shop = await getCurrentShop()
  if (!shop) return null
  const invoices = await getInvoices(shop.id, { limit: 200 })
  return <InvoicesTable initialInvoices={invoices} />
}
