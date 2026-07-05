'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

export function AddPurchaseDialog({
  open,
  onOpenChange,
  shopId,
  suppliers,
  products,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  suppliers: any[]
  products: any[]
}) {
  const [loading, setLoading] = useState(false)

  const [supplierId, setSupplierId] =
    useState('')

  const [productId, setProductId] =
    useState('')

  const [quantity, setQuantity] =
    useState('')

  const [unitPrice, setUnitPrice] =
    useState('')

  const [notes, setNotes] =
    useState('')

  async function handleSave() {
    try {
      setLoading(true)

      if (!supplierId) {
        toast.error('Select supplier')
        return
      }

      if (!productId) {
        toast.error('Select product')
        return
      }

      const qty = Number(quantity)
      const price = Number(unitPrice)

      if (qty <= 0 || price <= 0) {
        toast.error(
          'Quantity and price must be greater than zero'
        )
        return
      }

      const total = qty * price

      const purchaseNumber =
        'PO-' + Date.now()

      const supabase = createClient()

      const { data: order, error: orderError } =
        await supabase
          .from('purchase_orders')
          .insert({
            shop_id: shopId,
            supplier_id: supplierId,
            purchase_number: purchaseNumber,
            purchase_date:
              new Date()
                .toISOString()
                .split('T')[0],
            subtotal: total,
            gst: 0,
            total,
            notes,
          })
          .select()
          .single()

      if (orderError) throw orderError

      const { error: itemError } =
        await supabase
          .from('purchase_items')
          .insert({
            purchase_id: order.id,
            product_id: productId,
            quantity: qty,
            unit_price: price,
            total,
          })

      if (itemError) throw itemError

      const product = products.find(
        (p) => p.id === productId
      )

      if (!product)
        throw new Error(
          'Product not found'
        )

      const newStock =
        Number(product.current_stock) +
        qty

      const { error: stockError } =
        await supabase
          .from('products')
          .update({
            current_stock: newStock,
          })
          .eq('id', productId)

      if (stockError) throw stockError

      const { error: ledgerError } =
        await supabase
          .from('stock_ledger')
          .insert({
            shop_id: shopId,
            product_id: productId,
            change_type: 'PURCHASE',
            quantity: qty,
            notes:
              'Purchase ' +
              purchaseNumber,
          })

      if (ledgerError) throw ledgerError

      toast.success(
        'Purchase saved successfully'
      )

      onOpenChange(false)

      setSupplierId('')
      setProductId('')
      setQuantity('')
      setUnitPrice('')
      setNotes('')
    } catch (err: any) {
      toast.error(
        err.message ||
          'Failed to save purchase'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd] max-w-xl">
        <DialogHeader>
          <DialogTitle>
            New Purchase
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <Label>Supplier</Label>

            <Select
              value={supplierId}
              onValueChange={
                setSupplierId
              }
            >
              <SelectTrigger className="bg-[#0b1326] border-[#464554] text-[#dae2fd]">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>

              <SelectContent className="bg-[#171f33] border-[#464554] text-[#dae2fd]">
                {suppliers.map(
                  (supplier) => (
                    <SelectItem
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Product</Label>

            <Select
              value={productId}
              onValueChange={
                setProductId
              }
            >
              <SelectTrigger className="bg-[#0b1326] border-[#464554] text-[#dae2fd]">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>

              <SelectContent className="bg-[#171f33] border-[#464554] text-[#dae2fd]">
                {products.map(
                  (product) => (
                    <SelectItem
                      key={product.id}
                      value={product.id}
                    >
                      {product.name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Quantity</Label>

            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="10"
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div>
            <Label>Unit Price</Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) =>
                setUnitPrice(
                  e.target.value
                )
              }
              placeholder="100.00"
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div>
            <Label>Notes</Label>

            <Input
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Optional notes"
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="primary-gradient text-white"
          >
            {loading
              ? 'Saving...'
              : 'Save Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}