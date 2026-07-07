
import { createClient } from './supabase/server'

// ============================================
// SHOP
// ============================================
export async function getCurrentShop() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .single()
  return shop
}

// ============================================
// INVOICE DETAIL (ONLY ONE - FIXED)
// ============================================
export async function getInvoice(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*),
      items:invoice_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('getInvoice error:', error)
    return null
  }
  
  return data  // ✅ Returns the data
}

// ============================================
// INVOICES LIST
// ============================================
export async function getInvoices(shopId: string, filters: any = {}) {
  const supabase = await createClient()
  let query = supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(id, name, phone, state)
    `)
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
  
  if (filters.limit) query = query.limit(filters.limit)
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  
  const { data, error } = await query
  if (error) {
    console.error('getInvoices error:', error)
    return []
  }
  return data || []
}

// ============================================
// CUSTOMERS
// ============================================
export async function getCustomers(shopId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shopId)
    .order('name')
  
  if (error) {
    console.error('getCustomers error:', error)
    return []
  }
  return data || []
}

// ============================================
// PRODUCTS
// ============================================
export async function getProducts(shopId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shopId)
    .eq('active', true)
    .order('name')
    .limit(200)
  
  if (error) {
    console.error('getProducts error:', error)
    return []
  }
  return data || []
}

// ============================================
// DASHBOARD STATS
// ============================================
export async function getDashboardStats(shopId: string) {
  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [todayInv, monthInv, customers, products, lowStock] = await Promise.all([
    supabase.from('invoices').select('total, status')
      .eq('shop_id', shopId).gte('created_at', today.toISOString()),
    supabase.from('invoices').select('total, status')
      .eq('shop_id', shopId).gte('created_at', monthStart.toISOString()),
    supabase.from('customers').select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId),
    supabase.from('products').select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId).eq('active', true),
    supabase.from('products').select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId).eq('active', true)
      .filter('current_stock', 'lte', 'low_stock_threshold'),
  ])

  const todaySales = todayInv.data?.reduce((s, i) => s + Number(i.total), 0) || 0
  const monthSales = monthInv.data?.reduce((s, i) => s + Number(i.total), 0) || 0
  const todayUnpaid = todayInv.data?.filter(i => i.status === 'Unpaid').length || 0

  return {
    todaySales, monthSales,
    todayCount: todayInv.data?.length || 0,
    monthCount: monthInv.data?.length || 0,
    customerCount: customers.count || 0,
    productCount: products.count || 0,
    lowStockCount: lowStock.count || 0,
    todayUnpaid,
  }
}

// ============================================
// GST REPORT
// ============================================
export async function getGSTReport(shopId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      invoice_number, date, total, cgst, sgst, igst, status,
      customer:customers(name, gstin, state)
    `)
    .eq('shop_id', shopId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
  
  if (error) {
    console.error('getGSTReport error:', error)
    return []
  }
  return data || []
}

// ============================================
// SUPPLIERS
// ============================================
export async function getSuppliers(shopId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('shop_id', shopId)
    .order('name')

  if (error) {
    console.error(error)
    return []
  }
  return data || []
}

// ============================================
// PURCHASES
// ============================================
export async function getPurchases(
  shopId: string
) {
  const supabase = await createClient()

  const { data, error } =
    await supabase
      .from('purchase_orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', {
        ascending: false,
      })

  if (error) {
    console.error(error)
    return []
  }

  return data || []
}
// ============================================
// RECENT PURCHASES
// ============================================
export async function getRecentPurchases(shopId: string, limit = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      purchase_number,
      purchase_date,
      total,
      status,
      created_at,
      supplier_id,
      suppliers (
        id,
        name
      )
    `)
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('getRecentPurchases error:', error)
    return []
  }
  return data || []
}

// ============================================
// PAYMENTS
// ============================================
export async function getInvoicesWithPayments(shopId: string) {
  const supabase = await createClient()
  
  const { data: invoices, error: invError } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      date,
      total,
      status,
      customer:customers(id, name, phone)
    `)
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (invError) {
    console.error('getInvoicesWithPayments error:', invError)
    return []
  }

  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('*')
    .eq('shop_id', shopId)

  if (payError) {
    console.error('payments fetch error:', payError)
  }

  return (invoices || []).map(invoice => {
    const invoicePayments = (payments || []).filter(p => p.invoice_id === invoice.id)
    const paidAmount = invoicePayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const outstanding = Number(invoice.total) - paidAmount
    
    return {
      ...invoice,
      paid_amount: paidAmount,
      outstanding_amount: outstanding,
      payment_count: invoicePayments.length,
      last_payment_date: invoicePayments[0]?.payment_date || null
    }
  })
}

export async function getPayments(shopId: string, filters: any = {}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('payments')
    .select(`
      *,
      invoice:invoices(
        id,
        invoice_number,
        total,
        customer:customers(id, name, phone)
      )
    `)
    .eq('shop_id', shopId)
    .order('payment_date', { ascending: false })
  
  if (filters.limit) query = query.limit(filters.limit)
  if (filters.invoice_id) query = query.eq('invoice_id', filters.invoice_id)
  if (filters.start_date) query = query.gte('payment_date', filters.start_date)
  if (filters.end_date) query = query.lte('payment_date', filters.end_date)
  
  const { data, error } = await query
  if (error) {
    console.error('getPayments error:', error)
    return []
  }
  return data || []
}

export async function createPayment(paymentData: {
  shop_id: string
  invoice_id: string
  amount: number
  payment_method: string
  payment_date: string
  reference_number?: string
  notes?: string
}) {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('shop_id', paymentData.shop_id)
  
  const paymentNumber = `PAY-${String((count || 0) + 1).padStart(5, '0')}`
  
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      ...paymentData,
      payment_number: paymentNumber
    }])
    .select()
    .single()
  
  if (error) {
    console.error('createPayment error:', error)
    return null
  }

  await updateInvoicePaymentStatus(paymentData.invoice_id, paymentData.shop_id)
  
  return data
}

export async function updateInvoicePaymentStatus(invoiceId: string, shopId: string) {
  const supabase = await createClient()
  
  const { data: invoice } = await supabase
    .from('invoices')
    .select('total')
    .eq('id', invoiceId)
    .single()
  
  if (!invoice) return

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', invoiceId)
  
  const paidAmount = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
  const total = Number(invoice.total)
  
  let status = 'Unpaid'
  if (paidAmount >= total) status = 'Paid'
  else if (paidAmount > 0) status = 'Partial'
  
  await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId)
}

export async function deletePayment(paymentId: string, shopId: string) {
  const supabase = await createClient()
  
  const { data: payment } = await supabase
    .from('payments')
    .select('invoice_id')
    .eq('id', paymentId)
    .single()
  
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('shop_id', shopId)
  
  if (error) {
    console.error('deletePayment error:', error)
    return false
  }
  
  if (payment?.invoice_id) {
    await updateInvoicePaymentStatus(payment.invoice_id, shopId)
  }
  
  return true
}

export async function getPaymentStats(shopId: string) {
  const supabase = await createClient()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, total, status')
    .eq('shop_id', shopId)

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, payment_date')
    .eq('shop_id', shopId)

  const todayPayments = (payments || [])
    .filter(p => new Date(p.payment_date) >= today)
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const monthPayments = (payments || [])
    .filter(p => new Date(p.payment_date) >= monthStart)
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalInvoiceAmount = (invoices || []).reduce((sum, i) => sum + Number(i.total), 0)
  const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
  const outstanding = totalInvoiceAmount - totalPaid

  const unpaidInvoices = (invoices || []).filter(i => i.status === 'Unpaid' || i.status === 'Partial').length

  return {
    todayPayments,
    monthPayments,
    outstanding,
    unpaidInvoices,
    totalInvoices: (invoices || []).length,
    totalPayments: (payments || []).length
  }
}
// ============================================
// PAYMENT METHODS BREAKDOWN
// ============================================
export async function getPaymentMethodsBreakdown(shopId: string, days = 30) {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount, payment_method, payment_date')
    .eq('shop_id', shopId)
    .gte('payment_date', startDate.toISOString().split('T')[0])
  
  if (error) {
    console.error('getPaymentMethodsBreakdown error:', error)
    return {
      cash: { count: 0, amount: 0 },
      upi: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      bank_transfer: { count: 0, amount: 0 },
      cheque: { count: 0, amount: 0 },
      other: { count: 0, amount: 0 },
      total: 0
    }
  }
  
  // Initialize all methods
  const breakdown: any = {
    cash: { count: 0, amount: 0 },
    upi: { count: 0, amount: 0 },
    card: { count: 0, amount: 0 },
    bank_transfer: { count: 0, amount: 0 },
    cheque: { count: 0, amount: 0 },
    other: { count: 0, amount: 0 },
    total: 0
  }
  
  // Aggregate by method
  ;(payments || []).forEach(p => {
    const method = p.payment_method?.toLowerCase() || 'other'
    if (breakdown[method]) {
      breakdown[method].count += 1
      breakdown[method].amount += Number(p.amount)
    } else {
      breakdown.other.count += 1
      breakdown.other.amount += Number(p.amount)
    }
    breakdown.total += Number(p.amount)
  })
  
  return breakdown
}
// ============================================
// REPORTS - SALES
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
  const totalTax = (invoices || []).reduce((sum, i) => sum + Number(i.cgst || 0) + Number(i.sgst || 0) + Number(i.igst || 0), 0)
  const totalCollected = (invoices || []).reduce((sum, i) => sum + Number(i.paid_amount || 0), 0)
  const totalPending = totalSales - totalCollected
  const invoiceCount = (invoices || []).length
  const avgInvoiceValue = invoiceCount > 0 ? totalSales / invoiceCount : 0

  // Daily breakdown
  const dailySales: Record<string, number> = {}
  ;(invoices || []).forEach(inv => {
    const date = inv.date
    dailySales[date] = (dailySales[date] || 0) + Number(inv.total)
  })

  return {
    invoices: invoices || [],
    summary: {
      totalSales,
      totalTax,
      totalCollected,
      totalPending,
      invoiceCount,
      avgInvoiceValue,
      dailySales
    }
  }
}

// ============================================
// REPORTS - PURCHASES
// ============================================
export async function getPurchaseReport(shopId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data: purchases, error } = await supabase
    .from('purchase_orders')
   .select(`
  id,
  purchase_number,
  purchase_date,
  total,
  subtotal,
  gst,
  status,
  supplier:suppliers(id, name, phone, gstin),
  items:purchase_items(
    id,
    quantity,
    unit_price,
    product:products(
      id,
      name
    )
  )
`)
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
    summary: {
      totalPurchases,
      totalGst,
      purchaseCount,
      avgPurchaseValue: purchaseCount > 0 ? totalPurchases / purchaseCount : 0
    }
  }
}

// ============================================
// REPORTS - STOCK
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
    sum + (Number(p.current_stock) * Number(p.purchase_price || p.selling_price || 0)), 0
  )
  const totalRetailValue = (products || []).reduce((sum, p) => 
    sum + (Number(p.current_stock) * Number(p.selling_price || 0)), 0
  )
  const lowStockCount = (products || []).filter(p => 
    Number(p.current_stock) <= Number(p.low_stock_threshold)
  ).length
  const outOfStockCount = (products || []).filter(p => Number(p.current_stock) === 0).length
  const inStockCount = totalProducts - outOfStockCount

  return {
    products: products || [],
    summary: {
      totalProducts,
      totalStockValue,
      totalRetailValue,
      lowStockCount,
      outOfStockCount,
      inStockCount,
      potentialProfit: totalRetailValue - totalStockValue
    }
  }
}

// ============================================
// REPORTS - CUSTOMERS
// ============================================
export async function getCustomerReport(shopId: string) {
  const supabase = await createClient()
  
  // Get all customers
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shopId)
    .order('name')

  if (custError) {
    console.error('getCustomerReport error:', custError)
    return { customers: [], topCustomers: [], summary: null }
  }

  // Get all invoices for these customers
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, customer_id, total, paid_amount, status, date')
    .eq('shop_id', shopId)

  // Aggregate per customer
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

  // Top customers by total billed
  const topCustomers = [...customerStats]
    .sort((a, b) => b.total_billed - a.total_billed)
    .slice(0, 10)

  const totalCustomers = customerStats.length
  const totalOutstanding = customerStats.reduce((sum, c) => sum + c.outstanding, 0)
  const activeCustomers = customerStats.filter(c => c.invoice_count > 0).length

  return {
    customers: customerStats,
    topCustomers,
    summary: {
      totalCustomers,
      totalOutstanding,
      activeCustomers,
      avgCustomerValue: activeCustomers > 0 
        ? customerStats.reduce((sum, c) => sum + c.total_billed, 0) / activeCustomers 
        : 0
    }
  }
}

// ============================================
// REPORTS - SUPPLIERS
// ============================================
export async function getSupplierReport(shopId: string) {
  const supabase = await createClient()
  
  const { data: suppliers, error: suppError } = await supabase
    .from('suppliers')
    .select('*')
    .eq('shop_id', shopId)
    .order('name')

  if (suppError) {
    console.error('getSupplierReport error:', suppError)
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

  const topSuppliers = [...supplierStats]
    .sort((a, b) => b.total_purchased - a.total_purchased)
    .slice(0, 10)

  const totalSuppliers = supplierStats.length
  const totalPurchased = supplierStats.reduce((sum, s) => sum + s.total_purchased, 0)
  const activeSuppliers = supplierStats.filter(s => s.purchase_count > 0).length

  return {
    suppliers: supplierStats,
    topSuppliers,
    summary: {
      totalSuppliers,
      totalPurchased,
      activeSuppliers
    }
  }
}

// ============================================
// REPORTS - GST SUMMARY
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
    summary: {
      totalCGST,
      totalSGST,
      totalIGST,
      totalTax,
      totalTaxable,
      totalInvoiceValue,
      invoiceCount: (invoices || []).length
    }
  }
}

// ============================================
// REPORTS - HSN SUMMARY
// ============================================
export async function getHSNSummaryReport(shopId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  
  const { data: items, error } = await supabase
    .from('invoice_items')
    .select(`
      id, hsn_code, quantity, unit_price, gst_rate, total,
      product:products(name, hsn_code),
      invoice:invoices!inner(shop_id, date, status)
    `)
    .eq('invoice.shop_id', shopId)
    .eq('invoice.status', 'Paid')
    .gte('invoice.date', startDate)
    .lte('invoice.date', endDate)

  if (error) {
    console.error('getHSNSummaryReport error:', error)
    return []
  }

  // Group by HSN code
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
