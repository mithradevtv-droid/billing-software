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
// INVOICES
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

// ⚠️ THIS IS THE KEY FUNCTION - MUST INCLUDE ITEMS!
export async function getInvoice(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*),
      items:invoice_items(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('getInvoice error:', error)
    return null
  }
  

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
