'use client'

import { createClient } from './supabase/client'

// ============================================
// CREATE CUSTOMER (Client-side safe)
// ============================================
export async function createCustomer(shopId: string, customer: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('customers')
    .insert({ ...customer, shop_id: shopId })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// CREATE INVOICE (with items!)
// ============================================
export async function createInvoice(
  shopId: string, 
  invoice: any, 
  items: any[]
) {
  const supabase = createClient()
  
  // 1. Create invoice
  const { data: inv, error: invError } = await supabase
    .from('invoices')
    .insert({ ...invoice, shop_id: shopId })
    .select()
    .single()
  
  if (invError) {
    console.error('Invoice creation error:', invError)
    throw invError
  }
  
  

  // 2. Create invoice items (CRITICAL!)
  if (items && items.length > 0) {
    const itemsWithInvoice = items.map(item => ({
      invoice_id: inv.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      sku: item.sku || null,
      hsn_code: item.hsn_code || null,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      discount_pct: Number(item.discount_pct || 0),
      gst_rate: Number(item.gst_rate),
      cgst: Number(item.cgst || 0),
      sgst: Number(item.sgst || 0),
      igst: Number(item.igst || 0),
      tax_amount: Number(item.cgst || 0) + Number(item.sgst || 0) + Number(item.igst || 0),
      total: Number(item.total),
    }))
    
    console.log('Inserting items:', itemsWithInvoice)
    
    const { data: insertedItems, error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoice)
      .select()
    
    if (itemsError) {
      console.error('Items insertion error:', itemsError)
      throw itemsError
    }
    
    console.log('Items inserted:', insertedItems?.length)
  }

  // 3. Update stock (subtract sold quantities)
  for (const item of items) {
    if (item.product_id) {
      // Get current stock
      const { data: product } = await supabase
        .from('products')
        .select('current_stock, name')
        .eq('id', item.product_id)
        .single()
      
      if (product) {
        const newStock = Number(product.current_stock) - Number(item.quantity)
        
        await supabase
          .from('products')
          .update({ current_stock: Math.max(0, newStock) })
          .eq('id', item.product_id)
        
        // Add to stock ledger
        await supabase.from('stock_ledger').insert({
          shop_id: shopId,
          product_id: item.product_id,
          change_type: 'SALE',
          quantity: -Number(item.quantity),
          reference_id: inv.id,
          notes: `Sale via ${inv.invoice_number}`,
        })
      }
    }
  }

  // 4. Increment invoice number
  const { data: shop } = await supabase
    .from('shops')
    .select('next_invoice_number')
    .eq('id', shopId)
    .single()
  
  if (shop) {
    await supabase
      .from('shops')
      .update({ next_invoice_number: shop.next_invoice_number + 1 })
      .eq('id', shopId)
  }

  return inv
}

// ============================================
// UPDATE INVOICE STATUS
// ============================================
export async function updateInvoiceStatus(
  invoiceId: string, 
  status: string,
  paidAmount?: number
) {
  const supabase = createClient()
  const updates: any = { status }
  if (paidAmount !== undefined) updates.paid_amount = paidAmount
  
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// DELETE INVOICE
// ============================================
export async function deleteInvoice(invoiceId: string) {
  const supabase = createClient()
  // Items will be deleted automatically (CASCADE)
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
  
  if (error) throw error
}
