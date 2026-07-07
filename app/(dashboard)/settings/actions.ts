// app/(dashboard)/settings/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function deleteAccountAction(shopId: string) {
  const supabase = await createClient()
const { data: shop } = await supabase
  .from('shops')
  .select('owner_id')
  .eq('id', shopId)
  .single()

const ownerId = shop?.owner_id

  // payments
const { error: paymentsError } = await supabase
  .from('payments')
  .delete()
  .eq('shop_id', shopId)

if (paymentsError) throw paymentsError

  // stock ledger
  await supabase
    .from('stock_ledger')
    .delete()
    .eq('shop_id', shopId)

  // invoice items
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id')
    .eq('shop_id', shopId)

  if (invoices?.length) {
    const invoiceIds = invoices.map(i => i.id)

    await supabase
      .from('invoice_items')
      .delete()
      .in('invoice_id', invoiceIds)
  }

  // invoices
  await supabase
    .from('invoices')
    .delete()
    .eq('shop_id', shopId)

  // purchases
  const { data: purchases } = await supabase
    .from('purchase_orders')
    .select('id')
    .eq('shop_id', shopId)

  if (purchases?.length) {
    const purchaseIds = purchases.map(p => p.id)

    await supabase
      .from('purchase_items')
      .delete()
      .in('purchase_id', purchaseIds)
  }

  await supabase
    .from('purchase_orders')
    .delete()
    .eq('shop_id', shopId)

  // products
  await supabase
    .from('products')
    .delete()
    .eq('shop_id', shopId)

  // suppliers
  await supabase
    .from('suppliers')
    .delete()
    .eq('shop_id', shopId)

  // customers
  await supabase
    .from('customers')
    .delete()
    .eq('shop_id', shopId)

  // finally shop
const { error } = await supabase
  .from('shops')
  .delete()
  .eq('id', shopId)

if (error) throw error

if (ownerId) {
  const { error: authError } =
    await adminClient.auth.admin.deleteUser(ownerId)

  if (authError) {
    throw authError
  }
}

return { success: true }
}