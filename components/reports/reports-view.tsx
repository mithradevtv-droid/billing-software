"use client"

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, TrendingUp, Package, Users, Truck, FileText, 
  Calendar, Download, RefreshCw, IndianRupee, Receipt,
  ShoppingCart, AlertTriangle, CheckCircle2, Hash
} from 'lucide-react'
import { loadReportAction } from '@/app/(dashboard)/reports/actions'
import { toast } from 'sonner'

interface ReportsViewProps {
  shopId: string
  shop: any
  initialType: string
  initialStartDate: string
  initialEndDate: string
}

export function ReportsView({ shopId, shop, initialType, initialStartDate, initialEndDate }: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState(initialType)
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [pending, startTransition] = useTransition()
  const [salesData, setSalesData] = useState<any>(null)
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const [stockData, setStockData] = useState<any>(null)
  const [customerData, setCustomerData] = useState<any>(null)
  const [supplierData, setSupplierData] = useState<any>(null)
  const [gstData, setGstData] = useState<any>(null)
  const [hsnData, setHSNData] = useState<any>(null)

  useEffect(() => {
    loadReport(activeTab)
  }, [activeTab])

  function loadReport(type: string) {
    startTransition(async () => {
      try {
        const data = await loadReportAction(type, shopId, startDate, endDate)
        
        if (!data) {
          toast.error('No data returned')
          return
        }
        
        if ((data as any).error) {
          toast.error((data as any).error)
          return
        }
        
        if (type === 'sales') setSalesData(data)
        else if (type === 'purchase') setPurchaseData(data)
        else if (type === 'stock') setStockData(data)
        else if (type === 'customer') setCustomerData(data)
        else if (type === 'supplier') setSupplierData(data)
        else if (type === 'gst') setGstData(data)
        else if (type === 'hsn') setHSNData(data)
      } catch (error) {
        console.error('Load report error:', error)
        toast.error('Failed to load report')
      }
    })
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    })
  }

  return (
    <div className="w-full space-y-6 animate-in pb-8">
      
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#4cd7f6] to-[#8083ff] flex items-center justify-center">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-xs font-medium text-[#4cd7f6] uppercase tracking-widest">
              ANALYTICS
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
            Reports
          </h1>
          <p className="text-sm text-[#908fa0] mt-0.5">
            Business insights and analytics dashboard
          </p>
        </div>
        <Button 
          onClick={() => loadReport(activeTab)}
          disabled={pending}
          className="bg-[#4cd7f6]/10 text-[#4cd7f6] hover:bg-[#4cd7f6] hover:text-[#0a0f1a] border border-[#4cd7f6]/30 h-10"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${pending ? 'animate-spin' : ''}`} /> 
          Refresh
        </Button>
      </div>

      {/* ==================== DATE RANGE ==================== */}
      <Card className="bg-[#0e1421] border-[#171f33]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3 w-full">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-[#908fa0] uppercase tracking-wider font-bold">From</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0a0f1a] border-[#171f33] text-[#dae2fd]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-[#908fa0] uppercase tracking-wider font-bold">To</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0a0f1a] border-[#171f33] text-[#dae2fd]"
                />
              </div>
            </div>
            <Button 
              onClick={() => loadReport(activeTab)}
              disabled={pending}
              className="primary-gradient text-white h-10 px-5 whitespace-nowrap"
            >
              <Calendar className="mr-2 h-4 w-4" /> Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ==================== TABS ==================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList 
          className="bg-[#0e1421] border border-[#171f33] p-1 inline-flex h-auto flex-wrap"
          style={{ display: 'inline-flex', flexDirection: 'row', gap: '0.25rem', width: 'auto', height: 'auto' }}
        >
          <TabsTrigger value="sales" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white flex items-center gap-2 px-3 py-2 rounded-md">
            <TrendingUp className="h-3.5 w-3.5" /><span className="text-xs font-semibold">Sales</span>
          </TabsTrigger>
          <TabsTrigger value="purchase" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white flex items-center gap-2 px-3 py-2 rounded-md">
            <ShoppingCart className="h-3.5 w-3.5" /><span className="text-xs font-semibold">Purchase</span>
          </TabsTrigger>
          <TabsTrigger value="stock" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white flex items-center gap-2 px-3 py-2 rounded-md">
            <Package className="h-3.5 w-3.5" /><span className="text-xs font-semibold">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="customer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white flex items-center gap-2 px-3 py-2 rounded-md">
            <Users className="h-3.5 w-3.5" /><span className="text-xs font-semibold">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="supplier" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white flex items-center gap-2 px-3 py-2 rounded-md">
            <Truck className="h-3.5 w-3.5" /><span className="text-xs font-semibold">Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="gst" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white flex items-center gap-2 px-3 py-2 rounded-md">
            <FileText className="h-3.5 w-3.5" /><span className="text-xs font-semibold">GST</span>
          </TabsTrigger>
          <TabsTrigger value="hsn" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white flex items-center gap-2 px-3 py-2 rounded-md">
            <Hash className="h-3.5 w-3.5" /><span className="text-xs font-semibold">HSN</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================== SALES REPORT ==================== */}
        <TabsContent value="sales" className="mt-4 space-y-4">
          {salesData?.summary ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportStatCard title="Total Sales" value={formatCurrency(salesData.summary.totalSales)} icon={IndianRupee} color="emerald" />
                <ReportStatCard title="Collected" value={formatCurrency(salesData.summary.totalCollected)} icon={CheckCircle2} color="sky" />
                <ReportStatCard title="Pending" value={formatCurrency(salesData.summary.totalPending)} icon={AlertTriangle} color="amber" />
                <ReportStatCard title="Invoices" value={salesData.summary.invoiceCount.toString()} icon={Receipt} color="purple" />
              </div>
              
              {salesData.invoices.length > 0 ? (
                <Card className="bg-[#0e1421] border-[#171f33]">
                  <div className="p-4 border-b border-[#171f33] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#dae2fd]">Sales Invoices ({salesData.invoices.length})</h3>
                    <Button size="sm" variant="outline" className="border-[#4cd7f6]/30 text-[#4cd7f6] hover:bg-[#4cd7f6]/10 h-8">
                      <Download className="h-3 w-3 mr-1" /> Export
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#171f33] bg-[#0a0f1a]">
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Date</th>
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Invoice</th>
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Customer</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Taxable</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Tax</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Total</th>
                          <th className="text-center p-3 text-[10px] font-bold text-[#908fa0] uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.invoices.slice(0, 50).map((inv: any) => (
                          <tr key={inv.id} className="border-b border-[#171f33] hover:bg-[#0a0f1a]/50">
                            <td className="p-3 text-xs text-[#c7c4d7]">{formatDate(inv.date)}</td>
                            <td className="p-3 font-mono text-xs font-bold text-[#dae2fd]">{inv.invoice_number}</td>
                            <td className="p-3 text-xs text-[#c7c4d7]">{inv.customer?.name || 'Walk-in'}</td>
                            <td className="p-3 text-right font-mono text-xs text-[#dae2fd]">{formatCurrency(inv.subtotal)}</td>
                            <td className="p-3 text-right font-mono text-xs text-[#c7c4d7]">{formatCurrency((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0))}</td>
                            <td className="p-3 text-right font-mono text-xs font-bold text-[#dae2fd]">{formatCurrency(inv.total)}</td>
                            <td className="p-3 text-center">
                              <Badge variant="outline" className={inv.status === 'Paid' ? 'border-emerald-500/30 text-emerald-400' : inv.status === 'Partial' ? 'border-sky-500/30 text-sky-400' : 'border-amber-500/30 text-amber-400'}>
                                {inv.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="bg-[#0e1421] border-[#171f33]">
                  <CardContent className="p-12 text-center">
                    <Receipt className="h-12 w-12 text-[#464554] mx-auto" />
                    <p className="text-[#dae2fd] mt-3 font-medium">No invoices in this period</p>
                    <p className="text-sm text-[#908fa0] mt-1">Try changing the date range</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-[#0e1421] border-[#171f33]">
              <CardContent className="p-12 text-center">
                {pending ? <RefreshCw className="h-8 w-8 text-[#4cd7f6] mx-auto animate-spin" /> : <BarChart3 className="h-12 w-12 text-[#464554] mx-auto" />}
                <p className="text-[#dae2fd] mt-3 font-medium">{pending ? 'Loading...' : 'No data available'}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== PURCHASE REPORT ==================== */}
        <TabsContent value="purchase" className="mt-4 space-y-4">
          {purchaseData?.summary ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <ReportStatCard title="Total Purchases" value={formatCurrency(purchaseData.summary.totalPurchases)} icon={ShoppingCart} color="sky" />
                <ReportStatCard title="GST Paid" value={formatCurrency(purchaseData.summary.totalGst)} icon={FileText} color="purple" />
                <ReportStatCard title="Orders" value={purchaseData.summary.purchaseCount.toString()} icon={Receipt} color="emerald" />
              </div>
              
              {purchaseData.purchases.length > 0 ? (
                <Card className="bg-[#0e1421] border-[#171f33]">
                  <div className="p-4 border-b border-[#171f33] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#dae2fd]">Purchase Orders ({purchaseData.purchases.length})</h3>
                    <Button size="sm" variant="outline" className="border-[#4cd7f6]/30 text-[#4cd7f6] hover:bg-[#4cd7f6]/10 h-8">
                      <Download className="h-3 w-3 mr-1" /> Export
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#171f33] bg-[#0a0f1a]">
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Date</th>
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">PO #</th>
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Supplier</th>
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Product</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Subtotal</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">GST</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseData.purchases.slice(0, 50).map((p: any) => (
                          <tr key={p.id} className="border-b border-[#171f33] hover:bg-[#0a0f1a]/50">
                            <td className="p-3 text-xs text-[#c7c4d7]">{formatDate(p.purchase_date)}</td>
                            <td className="p-3 font-mono text-xs font-bold text-[#dae2fd]">{p.purchase_number}</td>
                            <td className="p-3 text-xs text-[#c7c4d7]">{p.supplier?.name || 'N/A'}</td>
                            <td className="p-3 text-xs text-[#c7c4d7]">{p.items?.map( (item: any) => item.product?.name ).join(', ') || 'N/A'} </td>
                            <td className="p-3 text-right font-mono text-xs text-[#dae2fd]">{formatCurrency(p.subtotal)}</td>
                            <td className="p-3 text-right font-mono text-xs text-[#c7c4d7]">{formatCurrency(p.gst)}</td>
                            <td className="p-3 text-right font-mono text-xs font-bold text-[#dae2fd]">{formatCurrency(p.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="bg-[#0e1421] border-[#171f33]">
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-[#464554] mx-auto" />
                    <p className="text-[#dae2fd] mt-3 font-medium">No purchases in this period</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <LoadingState pending={pending} />
          )}
        </TabsContent>

        {/* ==================== STOCK REPORT ==================== */}
        <TabsContent value="stock" className="mt-4 space-y-4">
          {stockData?.summary ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportStatCard title="Total Products" value={stockData.summary.totalProducts.toString()} icon={Package} color="sky" />
                <ReportStatCard title="Stock Value" value={formatCurrency(stockData.summary.totalStockValue)} icon={IndianRupee} color="emerald" />
                <ReportStatCard title="Low Stock" value={stockData.summary.lowStockCount.toString()} icon={AlertTriangle} color="amber" />
                <ReportStatCard title="Out of Stock" value={stockData.summary.outOfStockCount.toString()} icon={AlertTriangle} color="red" />
              </div>
              
              {stockData.products.length > 0 ? (
                <Card className="bg-[#0e1421] border-[#171f33]">
                  <div className="p-4 border-b border-[#171f33]">
                    <h3 className="text-sm font-semibold text-[#dae2fd]">Stock Details</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#171f33] bg-[#0a0f1a]">
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Product</th>
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">SKU</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Stock</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Price</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Value</th>
                          <th className="text-center p-3 text-[10px] font-bold text-[#908fa0] uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockData.products.slice(0, 100).map((p: any) => {
                          const stock = Number(p.current_stock)
                          const threshold = Number(p.low_stock_threshold)
                          const isOut = stock === 0
                          const isLow = !isOut && stock <= threshold
                          return (
                            <tr key={p.id} className="border-b border-[#171f33] hover:bg-[#0a0f1a]/50">
                              <td className="p-3 text-xs text-[#dae2fd] font-medium">{p.name}</td>
                              <td className="p-3 font-mono text-xs text-[#c7c4d7]">{p.sku || '-'}</td>
                              <td className="p-3 text-right font-mono text-xs text-[#dae2fd] font-bold">{stock}</td>
                              <td className="p-3 text-right font-mono text-xs text-[#c7c4d7]">{formatCurrency(p.selling_price)}</td>
                              <td className="p-3 text-right font-mono text-xs text-emerald-400 font-semibold">{formatCurrency(stock * Number(p.selling_price || 0))}</td>
                              <td className="p-3 text-center">
                                {isOut ? (
                                  <Badge variant="outline" className="border-red-500/30 text-red-400">Out</Badge>
                                ) : isLow ? (
                                  <Badge variant="outline" className="border-amber-500/30 text-amber-400">Low</Badge>
                                ) : (
                                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">OK</Badge>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : null}
            </>
          ) : (
            <LoadingState pending={pending} />
          )}
        </TabsContent>

        {/* ==================== CUSTOMER REPORT ==================== */}
        <TabsContent value="customer" className="mt-4 space-y-4">
          {customerData?.summary ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <ReportStatCard title="Total Customers" value={customerData.summary.totalCustomers.toString()} icon={Users} color="sky" />
                <ReportStatCard title="Active" value={customerData.summary.activeCustomers.toString()} icon={CheckCircle2} color="emerald" />
                <ReportStatCard title="Total Outstanding" value={formatCurrency(customerData.summary.totalOutstanding)} icon={AlertTriangle} color="amber" />
              </div>
              
              {customerData.topCustomers.length > 0 ? (
                <Card className="bg-[#0e1421] border-[#171f33]">
                  <div className="p-4 border-b border-[#171f33]">
                    <h3 className="text-sm font-semibold text-[#dae2fd]">Top 10 Customers</h3>
                  </div>
                  <div className="divide-y divide-[#171f33]">
                    {customerData.topCustomers.map((c: any, i: number) => (
                      <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[#0a0f1a]/50">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-amber-500/20 text-amber-400' :
                            i === 1 ? 'bg-slate-400/20 text-slate-300' :
                            i === 2 ? 'bg-orange-600/20 text-orange-400' :
                            'bg-[#4cd7f6]/10 text-[#4cd7f6]'
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#dae2fd]">{c.name}</p>
                            <p className="text-xs text-[#908fa0]">{c.invoice_count} invoices {c.phone && `• ${c.phone}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">{formatCurrency(c.total_billed)}</p>
                          {c.outstanding > 0 && (
                            <p className="text-xs text-amber-400">Due: {formatCurrency(c.outstanding)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="bg-[#0e1421] border-[#171f33]">
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-[#464554] mx-auto" />
                    <p className="text-[#dae2fd] mt-3 font-medium">No customer data yet</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <LoadingState pending={pending} />
          )}
        </TabsContent>

        {/* ==================== SUPPLIER REPORT ==================== */}
        <TabsContent value="supplier" className="mt-4 space-y-4">
          {supplierData?.summary ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <ReportStatCard title="Total Suppliers" value={supplierData.summary.totalSuppliers.toString()} icon={Truck} color="sky" />
                <ReportStatCard title="Active" value={supplierData.summary.activeSuppliers.toString()} icon={CheckCircle2} color="emerald" />
                <ReportStatCard title="Total Purchased" value={formatCurrency(supplierData.summary.totalPurchased)} icon={IndianRupee} color="purple" />
              </div>
              
              {supplierData.topSuppliers.length > 0 ? (
                <Card className="bg-[#0e1421] border-[#171f33]">
                  <div className="p-4 border-b border-[#171f33]">
                    <h3 className="text-sm font-semibold text-[#dae2fd]">Top Suppliers</h3>
                  </div>
                  <div className="divide-y divide-[#171f33]">
                    {supplierData.topSuppliers.map((s: any, i: number) => (
                      <div key={s.id} className="p-4 flex items-center justify-between hover:bg-[#0a0f1a]/50">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#4cd7f6]/10 flex items-center justify-center text-xs font-bold text-[#4cd7f6]">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#dae2fd]">{s.name}</p>
                            <p className="text-xs text-[#908fa0]">{s.purchase_count} orders</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#4cd7f6]">{formatCurrency(s.total_purchased)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}
            </>
          ) : (
            <LoadingState pending={pending} />
          )}
        </TabsContent>

        {/* ==================== GST REPORT ==================== */}
        <TabsContent value="gst" className="mt-4 space-y-4">
          {gstData?.summary ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportStatCard title="Total Taxable" value={formatCurrency(gstData.summary.totalTaxable)} icon={IndianRupee} color="emerald" />
                <ReportStatCard title="CGST" value={formatCurrency(gstData.summary.totalCGST)} icon={FileText} color="sky" />
                <ReportStatCard title="SGST" value={formatCurrency(gstData.summary.totalSGST)} icon={FileText} color="purple" />
                <ReportStatCard title="IGST" value={formatCurrency(gstData.summary.totalIGST)} icon={FileText} color="amber" />
              </div>
              
              <Card className="bg-gradient-to-br from-[#4cd7f6]/10 to-[#8083ff]/10 border-[#4cd7f6]/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#908fa0] uppercase tracking-wider font-bold">Total Tax Collected</p>
                      <p className="text-3xl font-bold text-[#4cd7f6] mt-2">{formatCurrency(gstData.summary.totalTax)}</p>
                      <p className="text-xs text-[#908fa0] mt-2">From {gstData.summary.invoiceCount} invoices</p>
                    </div>
                    <FileText className="h-16 w-16 text-[#4cd7f6]/20" />
                  </div>
                </CardContent>
              </Card>

              {gstData.invoices.length > 0 ? (
                <Card className="bg-[#0e1421] border-[#171f33]">
                  <div className="p-4 border-b border-[#171f33] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#dae2fd]">Invoice Tax Details</h3>
                    <Button size="sm" variant="outline" className="border-[#4cd7f6]/30 text-[#4cd7f6] hover:bg-[#4cd7f6]/10 h-8">
                      <Download className="h-3 w-3 mr-1" /> Export GSTR1
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#171f33] bg-[#0a0f1a]">
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Date</th>
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Invoice</th>
                          <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">Customer</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Taxable</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">CGST</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">SGST</th>
                          <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">IGST</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gstData.invoices.slice(0, 50).map((inv: any) => (
                          <tr key={inv.id} className="border-b border-[#171f33] hover:bg-[#0a0f1a]/50">
                            <td className="p-3 text-xs text-[#c7c4d7]">{formatDate(inv.date)}</td>
                            <td className="p-3 font-mono text-xs font-bold text-[#dae2fd]">{inv.invoice_number}</td>
                            <td className="p-3 text-xs text-[#c7c4d7]">{inv.customer?.name || 'Walk-in'}</td>
                            <td className="p-3 text-right font-mono text-xs text-[#dae2fd]">{formatCurrency(inv.subtotal)}</td>
                            <td className="p-3 text-right font-mono text-xs text-sky-400">{formatCurrency(inv.cgst)}</td>
                            <td className="p-3 text-right font-mono text-xs text-purple-400">{formatCurrency(inv.sgst)}</td>
                            <td className="p-3 text-right font-mono text-xs text-amber-400">{formatCurrency(inv.igst)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : null}
            </>
          ) : (
            <LoadingState pending={pending} />
          )}
        </TabsContent>

        {/* ==================== HSN REPORT ==================== */}
        <TabsContent value="hsn" className="mt-4 space-y-4">
          {hsnData && hsnData.length > 0 ? (
            <Card className="bg-[#0e1421] border-[#171f33]">
              <div className="p-4 border-b border-[#171f33] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#dae2fd]">HSN Summary</h3>
                <Button size="sm" variant="outline" className="border-[#4cd7f6]/30 text-[#4cd7f6] hover:bg-[#4cd7f6]/10 h-8">
                  <Download className="h-3 w-3 mr-1" /> Export HSN
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#171f33] bg-[#0a0f1a]">
                      <th className="text-left p-3 text-[10px] font-bold text-[#908fa0] uppercase">HSN Code</th>
                      <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Quantity</th>
                      <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Value</th>
                      <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Tax</th>
                      <th className="text-right p-3 text-[10px] font-bold text-[#908fa0] uppercase">Invoices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hsnData.map((h: any) => (
                      <tr key={h.hsn_code} className="border-b border-[#171f33] hover:bg-[#0a0f1a]/50">
                        <td className="p-3 font-mono text-xs font-bold text-[#dae2fd]">{h.hsn_code}</td>
                        <td className="p-3 text-right font-mono text-xs text-[#c7c4d7]">{h.total_quantity}</td>
                        <td className="p-3 text-right font-mono text-xs text-[#dae2fd]">{formatCurrency(h.total_value)}</td>
                        <td className="p-3 text-right font-mono text-xs text-[#c7c4d7]">{formatCurrency(h.total_tax)}</td>
                        <td className="p-3 text-right text-xs text-[#908fa0]">{h.invoice_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <LoadingState pending={pending} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// STAT CARD COMPONENT
// ============================================
function ReportStatCard({ title, value, icon: Icon, color }: { 
  title: string
  value: string
  icon: any
  color: 'emerald' | 'sky' | 'purple' | 'amber' | 'red'
}) {
  const colors = {
    emerald: { text: 'text-emerald-400' },
    sky: { text: 'text-sky-400' },
    purple: { text: 'text-purple-400' },
    amber: { text: 'text-amber-400' },
    red: { text: 'text-red-400' }
  }
  
  return (
    <Card className="bg-[#0e1421] border-[#171f33]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-[#908fa0] uppercase tracking-wider font-bold">{title}</p>
          <Icon className={`h-3.5 w-3.5 ${colors[color].text}`} />
        </div>
        <p className="text-2xl font-bold text-[#dae2fd]">{value}</p>
      </CardContent>
    </Card>
  )
}

// ============================================
// LOADING STATE COMPONENT
// ============================================
function LoadingState({ pending }: { pending: boolean }) {
  return (
    <Card className="bg-[#0e1421] border-[#171f33]">
      <CardContent className="p-12 text-center">
        {pending ? (
          <>
            <RefreshCw className="h-8 w-8 text-[#4cd7f6] mx-auto animate-spin" />
            <p className="text-[#dae2fd] mt-3 font-medium">Loading report...</p>
          </>
        ) : (
          <>
            <BarChart3 className="h-12 w-12 text-[#464554] mx-auto" />
            <p className="text-[#dae2fd] mt-3 font-medium">No data available</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
