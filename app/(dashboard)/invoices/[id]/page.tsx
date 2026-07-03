import { notFound } from 'next/navigation'
import { getInvoice, getCurrentShop } from '@/lib/db'
import { InvoiceDetailView } from '@/components/invoices/invoice-detail-view'

export default async function InvoiceDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const shop = await getCurrentShop()
  if (!shop) return null

  const invoice = await getInvoice(id)
  
  if (!invoice || invoice.shop_id !== shop.id) {
    notFound()
  }

  return <InvoiceDetailView invoice={invoice} shop={shop} />
}
