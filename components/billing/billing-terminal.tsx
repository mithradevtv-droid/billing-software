'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, User, Plus, Minus, Trash2, ShoppingCart, 
  Receipt, X, UserPlus, ArrowRight, Loader2, Package
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { calculateItemTax, calculateInvoice, INDIAN_STATES } from '@/lib/gst-calculator'
import { createCustomer, createInvoice } from '@/lib/db-client'

interface CartItem {
  id: string
  product_id?: string
  product_name: string
  sku?: string
  hsn_code?: string
  quantity: number
  unit_price: number
  gst_rate: number
  discount_pct: number
}

export function BillingTerminal({ 
  shop, 
  initialProducts, 
  initialCustomers 
}: { 
  shop: any
  initialProducts: any[]
  initialCustomers: any[]
}) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  
  // Payment state
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid')
  const [initialPaymentAmount, setInitialPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!search) return initialProducts
    return initialProducts.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    )
  }, [initialProducts, search])

  // Add to cart
  function addToCart(product: any) {
    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        id: crypto.randomUUID(),
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        hsn_code: product.hsn_code,
        quantity: 1,
        unit_price: Number(product.selling_price),
        gst_rate: Number(product.gst_rate),
        discount_pct: 0,
      }])
    }
    toast.success(`${product.name} added`)
  }

  function updateCartItem(id: string, updates: Partial<CartItem>) {
    setCart(cart.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  function removeFromCart(id: string) {
    setCart(cart.filter(item => item.id !== id))
  }

  // Calculate totals
  const customerState = selectedCustomer?.state || shop.state
  const calculatedItems = useMemo(() => {
    return cart.map(item => {
      const calc = calculateItemTax(
        item.quantity, item.unit_price, item.gst_rate,
        shop.state, customerState, item.discount_pct
      )
      return { ...item, ...calc }
    })
  }, [cart, customerState, shop.state])

  const totals = useMemo(() => calculateInvoice(calculatedItems), [calculatedItems])

  // Calculate paid amount based on payment status
  const paidAmount = useMemo(() => {
    if (paymentStatus === 'Paid') return totals.total
    if (paymentStatus === 'Partial') return Math.min(Number(initialPaymentAmount) || 0, totals.total)
    return 0
  }, [paymentStatus, initialPaymentAmount, totals.total])

  const outstandingAmount = totals.total - paidAmount

  // Auto-fill amount when switching to Paid
  function handlePaymentStatusChange(value: 'Paid' | 'Partial' | 'Unpaid') {
    setPaymentStatus(value)
    if (value === 'Paid') {
      setInitialPaymentAmount(totals.total.toString())
    } else if (value === 'Unpaid') {
      setInitialPaymentAmount('')
    }
  }

  // Add customer
  async function handleAddCustomer(formData: any) {
    setLoading(true)
    try {
      const newCustomer = await createCustomer(shop.id, formData)
      setSelectedCustomer(newCustomer)
      setShowNewCustomerDialog(false)
      toast.success('Customer added!')
    } catch (e: any) {
      toast.error(e.message || 'Failed to add customer')
    } finally {
      setLoading(false)
    }
  }

  // Checkout - handles all 3 payment statuses
  async function handleCheckout() {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    // Validation
    if (paymentStatus === 'Partial') {
      const amt = Number(initialPaymentAmount)
      if (isNaN(amt) || amt <= 0) {
        toast.error('Please enter a valid partial payment amount')
        return
      }
      if (amt > totals.total) {
        toast.error(`Payment cannot exceed total: ₹${totals.total}`)
        return
      }
      if (amt === totals.total) {
        toast.error('Use "Paid" status for full payment')
        return
      }
    }

    if (paymentStatus === 'Paid') {
      const amt = Number(initialPaymentAmount)
      if (amt !== totals.total) {
        toast.error('Paid amount must equal total')
        return
      }
    }

    setLoading(true)
    try {
      const invoice = {
        customer_id: selectedCustomer?.id || null,
        invoice_number: `${shop.invoice_prefix}-${String(shop.next_invoice_number).padStart(5, '0')}`,
        date: new Date().toISOString().split('T')[0],
        billing_state: customerState,
        subtotal: totals.subtotal,
        cgst: totals.cgstTotal,
        sgst: totals.sgstTotal,
        igst: totals.igstTotal,
        total: totals.total,
        status: paymentStatus,
        paid_amount: paidAmount,
        notes,
      }
      
      console.log('CHECKOUT:', { invoice, paidAmount, outstandingAmount })
      
      const items = calculatedItems.map(({ id, ...item }) => item)
      const newInvoice = await createInvoice(shop.id, invoice, items)
      
      // Record payment for Paid and Partial
      if ((paymentStatus === 'Paid' || paymentStatus === 'Partial') && paidAmount > 0) {
        try {
          const { recordPaymentAction } = await import('@/app/(dashboard)/payments/actions')
          const formData = new FormData()
          formData.append('shop_id', shop.id)
          formData.append('invoice_id', newInvoice.id)
          formData.append('amount', paidAmount.toString())
          formData.append('payment_method', paymentMethod)
          formData.append('payment_date', new Date().toISOString().split('T')[0])
          formData.append('reference_number', '')
          formData.append('notes', paymentStatus === 'Paid' 
            ? 'Full payment at invoice creation' 
            : 'Initial partial payment at invoice creation')
          
          await recordPaymentAction(formData)
          
          if (paymentStatus === 'Paid') {
            toast.success(`Invoice ${invoice.invoice_number} created & fully paid! 🎉`)
          } else {
            toast.success(`Invoice created! ₹${paidAmount} received, ₹${outstandingAmount} pending.`)
          }
        } catch (payError) {
          console.error('Payment recording error:', payError)
          toast.success('Invoice created! (Payment recording failed - record manually)')
        }
      } else {
        toast.success(`Invoice ${invoice.invoice_number} created!`)
      }
      
      setCart([])
      setSelectedCustomer(null)
      setNotes('')
      setPaymentStatus('Unpaid')
      setInitialPaymentAmount('')
      setPaymentMethod('cash')
      setShowCheckoutDialog(false)
      router.push(`/invoices/${newInvoice.id}`)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'Failed to create invoice')
      console.error('Checkout error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      {/* LEFT: Products */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#dae2fd]">
              New Invoice
            </h1>
            <p className="text-sm text-[#c7c4d7]">Add items to cart</p>
          </div>
          <Badge variant="outline" className="border-[#464554] text-[#4cd7f6] font-mono">
            {shop.invoice_prefix}-{String(shop.next_invoice_number).padStart(5, '0')}
          </Badge>
        </div>

        {/* Search */}
        <Card className="midnight-card border-[#464554]">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0]" />
              <Input
                placeholder="Search by name, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#c7c4d7]">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No products found</p>
              <Button asChild variant="link" className="text-[#4cd7f6]">
                <a href="/products">Add products</a>
              </Button>
            </div>
          ) : (
            filteredProducts.map(product => {
              const inCart = cart.find(i => i.product_id === product.id)
              const lowStock = product.current_stock <= product.low_stock_threshold
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.current_stock <= 0}
                  className="group midnight-card border-[#464554] rounded-xl p-3 text-left hover:border-[#4cd7f6] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {inCart && (
                    <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-[#4cd7f6] text-[#003640]">
                      {inCart.quantity}
                    </Badge>
                  )}
                  {lowStock && product.current_stock > 0 && (
                    <Badge variant="outline" className="absolute top-2 right-2 text-[10px] border-[#f59e0b] text-[#f59e0b]">
                      Low
                    </Badge>
                  )}
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-[#4cd7f6]/10 to-[#8083ff]/10 flex items-center justify-center mb-2">
                    <Package className="h-8 w-8 text-[#4cd7f6]/60 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="font-medium text-sm text-[#dae2fd] line-clamp-2 leading-tight min-h-[2.5rem]">
                    {product.name}
                  </p>
                  <p className="text-xs text-[#908fa0] mt-0.5"> SKU:{product.sku}</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="font-bold text-[#4cd7f6]">
                      ₹{Number(product.selling_price).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-[#908fa0]">
                      GST {product.gst_rate}%
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {/* Customer */}
        <Card className="midnight-card border-[#464554]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-[#908fa0] uppercase tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" /> Customer
              </p>
              {selectedCustomer ? (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setSelectedCustomer(null)}
                  className="h-7 px-2 text-[#908fa0] hover:text-[#ef4444]"
                >
                  <X className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setShowNewCustomerDialog(true)}
                  className="h-7 px-2 text-[#4cd7f6] hover:text-[#4cd7f6] hover:bg-[#4cd7f6]/10"
                >
                  <UserPlus className="h-3 w-3 mr-1" /> New
                </Button>
              )}
            </div>
            {selectedCustomer ? (
              <div className="space-y-1">
                <p className="font-semibold text-[#dae2fd]">{selectedCustomer.name}</p>
                <p className="text-sm text-[#c7c4d7]">{selectedCustomer.phone}</p>
                {selectedCustomer.gstin && (
                  <p className="text-xs text-[#908fa0]">GSTIN: {selectedCustomer.gstin}</p>
                )}
                <p className="text-xs text-[#908fa0]">{selectedCustomer.state}</p>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start border-[#464554] text-[#c7c4d7] hover:bg-[#0b1326] hover:border-[#4cd7f6] hover:text-[#dae2fd]"
                onClick={() => setShowCustomerDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" /> Select customer
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Cart */}
        <Card className="midnight-card border-[#464554]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-[#908fa0] uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart className="h-3 w-3" /> Cart ({cart.length})
              </p>
              {cart.length > 0 && (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setCart([])}
                  className="h-7 px-2 text-xs text-[#908fa0] hover:text-[#ef4444]"
                >
                  Clear
                </Button>
              )}
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-[#c7c4d7]">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs mt-1">Click products to add</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {calculatedItems.map(item => (
                  <div key={item.id} className="bg-[#0b1326] rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#dae2fd] line-clamp-1">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-[#908fa0]">
                          ₹{item.unit_price} × {item.quantity} • GST {item.gst_rate}%
                        </p>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="h-7 w-7 text-[#908fa0] hover:text-[#ef4444]"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-[#171f33] rounded-md border border-[#464554]">
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => updateCartItem(item.id, { 
                            quantity: Math.max(0.1, item.quantity - 1) 
                          })}
                          className="h-7 w-7 text-[#4cd7f6]"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-[#dae2fd]">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => updateCartItem(item.id, { 
                            quantity: item.quantity + 1 
                          })}
                          className="h-7 w-7 text-[#4cd7f6]"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-semibold text-sm text-[#dae2fd]">
                        ₹{item.total.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        {cart.length > 0 && (
          <Card className="midnight-card border-[#464554] bg-gradient-to-br from-[#4cd7f6]/5 to-[#8083ff]/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#c7c4d7]">Subtotal</span>
                <span className="font-mono text-[#dae2fd]">
                  ₹{totals.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {totals.cgstTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#c7c4d7]">CGST</span>
                  <span className="font-mono text-[#dae2fd]">
                    ₹{totals.cgstTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {totals.sgstTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#c7c4d7]">SGST</span>
                  <span className="font-mono text-[#dae2fd]">
                    ₹{totals.sgstTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {totals.igstTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#c7c4d7]">IGST</span>
                  <span className="font-mono text-[#dae2fd]">
                    ₹{totals.igstTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-[#464554] flex justify-between items-center">
                <span className="font-bold text-[#dae2fd]">Total</span>
                <span className="font-bold text-xl text-[#4cd7f6]">
                  ₹{totals.total.toLocaleString('en-IN')}
                </span>
              </div>
              <Button
                className="w-full mt-3 h-12 primary-gradient text-white font-bold"
                onClick={() => setShowCheckoutDialog(true)}
                disabled={loading}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Generate Invoice
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Picker Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd]">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <Button
              variant="outline"
              className="w-full justify-start border-[#464554] hover:bg-[#0b1326]"
              onClick={() => { setSelectedCustomer(null); setShowCustomerDialog(false) }}
            >
              <User className="h-4 w-4 mr-2" /> Walk-in customer
            </Button>
            {initialCustomers.map((c: any) => (
              <Button
                key={c.id}
                variant="outline"
                className="w-full justify-start h-auto py-2 border-[#464554] hover:bg-[#0b1326] hover:border-[#4cd7f6]"
                onClick={() => { setSelectedCustomer(c); setShowCustomerDialog(false) }}
              >
                <div className="text-left">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-[#908fa0]">{c.phone} • {c.state}</p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            handleAddCustomer({
              name: fd.get('name'),
              phone: fd.get('phone'),
              email: fd.get('email') || null,
              gstin: fd.get('gstin') || null,
              address: fd.get('address') || null,
              state: fd.get('state'),
            })
          }} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required className="bg-[#0b1326] border-[#464554]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" required className="bg-[#0b1326] border-[#464554]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select name="state" required>
                <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="bg-[#171f33] border-[#464554]">
                  {INDIAN_STATES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN (optional)</Label>
              <Input id="gstin" name="gstin" className="bg-[#0b1326] border-[#464554]" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="primary-gradient">
                {loading ? 'Adding...' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog with Payment Method for ALL paid options */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd]">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-[#c7c4d7]">
              Total: <span className="font-bold text-[#4cd7f6] text-lg">
                ₹{totals.total.toLocaleString('en-IN')}
              </span>
            </p>

            {/* Payment Status Selector */}
            <div className="space-y-2">
              <Label htmlFor="payment-status">Payment Status *</Label>
              <Select value={paymentStatus} onValueChange={handlePaymentStatusChange}>
                <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#171f33] border-[#464554]">
                  <SelectItem value="Paid">💚 Paid (Full)</SelectItem>
                  <SelectItem value="Partial">💛 Partial Payment</SelectItem>
                  <SelectItem value="Unpaid">🔴 Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Amount - shown for Paid and Partial */}
            {paymentStatus === 'Partial' && (
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Payment Amount (₹) *</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max={totals.total - 1}
                  value={initialPaymentAmount}
                  onChange={(e) => setInitialPaymentAmount(e.target.value)}
                  placeholder={`Max: ${totals.total - 1}`}
                  className="bg-[#0b1326] border-[#464554]"
                  required
                />
                <p className="text-xs text-[#908fa0]">
                  Customer pays now, balance ₹{(totals.total - Number(initialPaymentAmount || 0)).toLocaleString('en-IN')} later
                </p>
              </div>
            )}

            {paymentStatus === 'Paid' && (
              <div className="space-y-2">
                <Label htmlFor="payment-amount-paid">Amount Received (₹) *</Label>
                <Input
                  id="payment-amount-paid"
                  type="number"
                  step="0.01"
                  value={initialPaymentAmount}
                  onChange={(e) => setInitialPaymentAmount(e.target.value)}
                  placeholder={totals.total.toString()}
                  className="bg-[#0b1326] border-[#464554]"
                  required
                />
                <p className="text-xs text-[#908fa0]">
                  Full payment: ₹{totals.total.toLocaleString('en-IN')}
                </p>
              </div>
            )}

            {/* Payment Method - shown for BOTH Paid and Partial */}
            {(paymentStatus === 'Paid' || paymentStatus === 'Partial') && (
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#171f33] border-[#464554]">
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="upi">📱 UPI</SelectItem>
                    <SelectItem value="card">💳 Card</SelectItem>
                    <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                    <SelectItem value="cheque">📝 Cheque</SelectItem>
                    <SelectItem value="other">🔖 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show calculation preview for partial */}
            {paymentStatus === 'Partial' && Number(initialPaymentAmount) > 0 && (
              <div className="bg-[#0b1326] border border-[#464554] rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#c7c4d7]">Paid now ({paymentMethod}):</span>
                  <span className="text-[#3ddc97] font-bold">
                    ₹{Math.min(Number(initialPaymentAmount), totals.total).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#c7c4d7]">Outstanding:</span>
                  <span className="text-[#ffce50] font-bold">
                    ₹{Math.max(0, totals.total - Number(initialPaymentAmount)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thank you for your business"
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
              disabled={loading}
              className="border-[#464554]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="primary-gradient"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Receipt className="h-4 w-4 mr-2" />
              )}
              {paymentStatus === 'Paid' && 'Create & Mark Paid'}
              {paymentStatus === 'Unpaid' && 'Create Unpaid Invoice'}
              {paymentStatus === 'Partial' && 'Create with Partial Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
