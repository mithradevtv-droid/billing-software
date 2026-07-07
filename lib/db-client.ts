import { createClient } from './supabase/client'

// ============================================
// CREATE CUSTOMER
// ============================================
export async function createCustomer(shopId: string, customer: any) {
  const supabase = await createClient()
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
  const supabase = await createClient()
  
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

  // 2. Create invoice items
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
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoice)
    
    if (itemsError) {
      console.error('Items insertion error:', itemsError)
      throw itemsError
    }
  }

  // 3. Update stock
  for (const item of items) {
    if (item.product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', item.product_id)
        .single()
      
      if (product) {
        const newStock = Number(product.current_stock) - Number(item.quantity)
        await supabase
          .from('products')
          .update({ current_stock: Math.max(0, newStock) })
          .eq('id', item.product_id)
        
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
  const supabase = await createClient()
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
  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
  
  if (error) throw error
}

// ============================================
// SALES REPORT
// ============================================
export async function getSalesReport(shopId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, date, total, cgst, sgst, igst, 
      subtotal, status, paid_amount,
      customer:customers(id, name, phone, gstin)
    `)
    .eq('shop_id', shopId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) {
    console.error('getSalesReport error:', error)
    return { invoices: [], summary: null }
  }

  const totalSales = (invoices || []).reduce((sum, i) => sum + Number(i.total), 0)
  const totalTax = (invoices || []).reduce((sum, i) => 
    sum + Number(i.cgst || 0) + Number(i.sgst || 0) + Number(i.igst || 0), 0)
  const totalCollected = (invoices || []).reduce((sum, i) => sum + Number(i.paid_amount || 0), 0)
  const totalPending = totalSales - totalCollected
  const invoiceCount = (invoices || []).length
  const avgInvoiceValue = invoiceCount > 0 ? totalSales / invoiceCount : 0

  return {
    invoices: invoices || [],
    summary: { totalSales, totalTax, totalCollected, totalPending, invoiceCount, avgInvoiceValue }
  }
}

// ============================================
// PURCHASE REPORT
// ============================================
export async function getPurchaseReport(shopId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data: purchases, error } = await supabase
    .from('purchase_orders')
    .select(`
      id, purchase_number, purchase_date, total, subtotal, gst, status,
      supplier:suppliers(id, name, phone)
    `)
    .eq('shop_id', shopId)
    .gte('purchase_date', startDate)
    .lte('purchase_date', endDate)
    .order('purchase_date', { ascending: false })

  if (error) {
    console.error('getPurchaseReport error:', error)
    return { purchases: [], summary: null }
  }

  const totalPurchases = (purchases || []).reduce((sum, p) => sum + Number(p.total), 0)
  const totalGst = (purchases || []).reduce((sum, p) => sum + Number(p.gst || 0), 0)
  const purchaseCount = (purchases || []).length

  return {
    purchases: purchases || [],
    summary: { totalPurchases, totalGst, purchaseCount, avgPurchaseValue: purchaseCount > 0 ? totalPurchases / purchaseCount : 0 }
  }
}

// ============================================
// STOCK REPORT
// ============================================
export async function getStockReport(shopId: string) {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)
    .eq('active', true)
    .order('name')

  if (error) {
    console.error('getStockReport error:', error)
    return { products: [], summary: null }
  }

  const totalProducts = (products || []).length
  const totalStockValue = (products || []).reduce((sum, p) => 
    sum + (Number(p.current_stock) * Number(p.purchase_price || p.selling_price || 0)), 0)
  const totalRetailValue = (products || []).reduce((sum, p) => 
    sum + (Number(p.current_stock) * Number(p.selling_price || 0)), 0)
  const lowStockCount = (products || []).filter(p => 
    Number(p.current_stock) <= Number(p.low_stock_threshold)).length
  const outOfStockCount = (products || []).filter(p => Number(p.current_stock) === 0).length

  return {
    products: products || [],
    summary: { totalProducts, totalStockValue, totalRetailValue, lowStockCount, outOfStockCount }
  }
}

// ============================================
// CUSTOMER REPORT
// ============================================
export async function getCustomerReport(shopId: string) {
  const supabase = await createClient()
  
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shopId)
    .order('name')

  if (custError) {
    console.error('getCustomerReport error:', custError)
    return { customers: [], topCustomers: [], summary: null }
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, customer_id, total, paid_amount, status, date')
    .eq('shop_id', shopId)

  const customerStats = (customers || []).map(customer => {
    const customerInvoices = (invoices || []).filter(i => i.customer_id === customer.id)
    const totalBilled = customerInvoices.reduce((sum, i) => sum + Number(i.total), 0)
    const totalPaid = customerInvoices.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0)
    const outstanding = totalBilled - totalPaid
    const invoiceCount = customerInvoices.length

    return {
      ...customer,
      total_billed: totalBilled,
      total_paid: totalPaid,
      outstanding,
      invoice_count: invoiceCount,
      last_invoice_date: customerInvoices[0]?.date || null
    }
  })

  const topCustomers = [...customerStats].sort((a, b) => b.total_billed - a.total_billed).slice(0, 10)
  const totalCustomers = customerStats.length
  const totalOutstanding = customerStats.reduce((sum, c) => sum + c.outstanding, 0)
  const activeCustomers = customerStats.filter(c => c.invoice_count > 0).length

  return {
    customers: customerStats,
    topCustomers,
    summary: { totalCustomers, totalOutstanding, activeCustomers }
  }
}

// ============================================
// SUPPLIER REPORT
// ============================================
export async function getSupplierReport(shopId: string) {
  const supabase = await createClient()
  
  const { data: suppliers, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('shop_id', shopId)
    .order('name')

  if (error) {
    console.error('getSupplierReport error:', error)
    return { suppliers: [], topSuppliers: [], summary: null }
  }

  const { data: purchases } = await supabase
    .from('purchase_orders')
    .select('id, supplier_id, total, status, purchase_date')
    .eq('shop_id', shopId)

  const supplierStats = (suppliers || []).map(supplier => {
    const supplierPurchases = (purchases || []).filter(p => p.supplier_id === supplier.id)
    const totalPurchased = supplierPurchases.reduce((sum, p) => sum + Number(p.total), 0)
    const purchaseCount = supplierPurchases.length

    return {
      ...supplier,
      total_purchased: totalPurchased,
      purchase_count: purchaseCount,
      last_purchase_date: supplierPurchases[0]?.purchase_date || null
    }
  })

  const topSuppliers = [...supplierStats].sort((a, b) => b.total_purchased - a.total_purchased).slice(0, 10)
  const totalSuppliers = supplierStats.length
  const totalPurchased = supplierStats.reduce((sum, s) => sum + s.total_purchased, 0)
  const activeSuppliers = supplierStats.filter(s => s.purchase_count > 0).length

  return {
    suppliers: supplierStats,
    topSuppliers,
    summary: { totalSuppliers, totalPurchased, activeSuppliers }
  }
}

// ============================================
// GST SUMMARY REPORT
// ============================================
export async function getGSTSummaryReport(shopId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, date, subtotal, cgst, sgst, igst, total,
      customer:customers(name, gstin, state)
    `)
    .eq('shop_id', shopId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) {
    console.error('getGSTSummaryReport error:', error)
    return { invoices: [], summary: null }
  }

  const totalCGST = (invoices || []).reduce((sum, i) => sum + Number(i.cgst || 0), 0)
  const totalSGST = (invoices || []).reduce((sum, i) => sum + Number(i.sgst || 0), 0)
  const totalIGST = (invoices || []).reduce((sum, i) => sum + Number(i.igst || 0), 0)
  const totalTax = totalCGST + totalSGST + totalIGST
  const totalTaxable = (invoices || []).reduce((sum, i) => sum + Number(i.subtotal || 0), 0)
  const totalInvoiceValue = (invoices || []).reduce((sum, i) => sum + Number(i.total), 0)

  return {
    invoices: invoices || [],
    summary: { totalCGST, totalSGST, totalIGST, totalTax, totalTaxable, totalInvoiceValue, invoiceCount: (invoices || []).length }
  }
}

// ============================================
// HSN SUMMARY REPORT
// ============================================
export async function getHSNSummaryReport(shopId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id')
    .eq('shop_id', shopId)
    .eq('status', 'Paid')
    .gte('date', startDate)
    .lte('date', endDate)

  if (!invoices || invoices.length === 0) return []

  const invoiceIds = invoices.map(i => i.id)
  
  const { data: items, error } = await supabase
    .from('invoice_items')
    .select(`
      id, hsn_code, quantity, unit_price, gst_rate, total,
      product:products(name, hsn_code)
    `)
    .in('invoice_id', invoiceIds)

  if (error) {
    console.error('getHSNSummaryReport error:', error)
    return []
  }

  const hsnGroups: Record<string, any> = {}
  ;(items || []).forEach(item => {
    const hsn = item.hsn_code || (item.product as any)?.hsn_code || 'N/A'
    if (!hsnGroups[hsn]) {
      hsnGroups[hsn] = {
        hsn_code: hsn,
        total_quantity: 0,
        total_value: 0,
        total_tax: 0,
        invoice_count: 0
      }
    }
    hsnGroups[hsn].total_quantity += Number(item.quantity)
    hsnGroups[hsn].total_value += Number(item.total || 0)
    hsnGroups[hsn].total_tax += Number(item.total || 0) * Number(item.gst_rate || 0) / 100
    hsnGroups[hsn].invoice_count += 1
  })

  return Object.values(hsnGroups).sort((a: any, b: any) => b.total_value - a.total_value)
}
export async function updateInvoicePaymentStatus(invoiceId: string) {
  const supabase = createClient()

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('total')
    .eq('id', invoiceId)
    .single()

  if (invoiceError) throw invoiceError
  if (!invoice) return

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', invoiceId)

  if (paymentsError) throw paymentsError

  const paidAmount = (payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const total = Number(invoice.total || 0)
  const status = paidAmount >= total ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid'

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ status, paid_amount: paidAmount })
    .eq('id', invoiceId)

  if (updateError) throw updateError
}

export async function createPayment(data: any) {
  const supabase = createClient()

  const { count, error: countError } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', data.shop_id)

  if (countError) throw countError

  const paymentNumber = `PAY-${String((count || 0) + 1).padStart(5, '0')}`
  const { data: payment, error } = await supabase
    .from('payments')
    .insert({ ...data, payment_number: paymentNumber })
    .select()
    .single()

  if (error) throw error

  await updateInvoicePaymentStatus(data.invoice_id)
  return payment
}