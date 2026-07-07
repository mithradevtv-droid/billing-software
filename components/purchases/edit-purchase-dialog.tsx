'use client'

import { useEffect, useState } from 'react'
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
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function EditPurchaseDialog({
  open,
  onOpenChange,
  purchase,
  suppliers,
  products,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchase: any
  suppliers: any[]
  products: any[]
}) {
  const [loading, setLoading] = useState(false)

  const [supplierId, setSupplierId] =
    useState('')

  const [productId, setProductId] =
    useState('')

  const [quantity, setQuantity] =
    useState(1)

  const [unitPrice, setUnitPrice] =
    useState(0)

  useEffect(() => {
    if (!purchase) return

    setSupplierId(
      purchase.supplier_id || ''
    )

    async function fetchItemDetails() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('purchase_items')
          .select('*')
          .eq('purchase_id', purchase.id)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setProductId(data.product_id || '')
          setQuantity(data.quantity || 1)
          setUnitPrice(Number(data.unit_price) || 0)
        }
      } catch (err) {
        console.error('Failed to fetch purchase item details:', err)
      }
    }

    fetchItemDetails()
  }, [purchase])

  if (!purchase) return null

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setLoading(true)

    try {
      const fd = new FormData(
        e.currentTarget
      )

      const supabase = createClient()

      const total =
        quantity * unitPrice

      const { error: orderError } =
        await supabase
          .from('purchase_orders')
          .update({
            supplier_id: supplierId,
            purchase_date:
              fd.get(
                'purchase_date'
              ),
            notes:
              fd.get('notes'),
            subtotal: total,
            total: total,
          })
          .eq('id', purchase.id)

      if (orderError)
        throw orderError

      const { error: itemError } =
        await supabase
          .from('purchase_items')
          .update({
            product_id: productId,
            quantity,
            unit_price: unitPrice,
            total,
          })
          .eq(
            'purchase_id',
            purchase.id
          )

      if (itemError)
        throw itemError

      toast.success(
        'Purchase updated'
      )

      onOpenChange(false)

      window.location.reload()
    } catch (err: any) {
      toast.error(
        err.message ||
          'Failed to update purchase'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd] max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Edit Purchase
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          <div>
            <Label>
              Supplier
            </Label>

            <Select
              value={supplierId}
              onValueChange={
                setSupplierId
              }
            >
              <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="bg-[#171f33] border-[#464554] text-[#dae2fd]">
                {suppliers.map(
                  (
                    supplier
                  ) => (
                    <SelectItem
                      key={
                        supplier.id
                      }
                      value={
                        supplier.id
                      }
                    >
                      {
                        supplier.name
                      }
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              Product
            </Label>

            <Select
              value={productId}
              onValueChange={
                setProductId
              }
            >
              <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="bg-[#171f33] border-[#464554] text-[#dae2fd]">
                {products.map(
                  (
                    product
                  ) => (
                    <SelectItem
                      key={
                        product.id
                      }
                      value={
                        product.id
                      }
                    >
                      {
                        product.name
                      }
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              Quantity
            </Label>

            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(
                e
              ) =>
                setQuantity(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div>
            <Label>
              Unit Price
            </Label>

            <Input
              type="number"
              min="0"
              value={
                unitPrice
              }
              onChange={(
                e
              ) =>
                setUnitPrice(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div>
            <Label>
              Purchase Date
            </Label>

            <Input
              type="date"
              name="purchase_date"
              defaultValue={
                purchase.purchase_date
              }
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div>
            <Label>
              Notes
            </Label>

            <Input
              name="notes"
              defaultValue={
                purchase.notes
              }
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div className="rounded-lg bg-[#0b1326] p-3 border border-[#464554]">
            <p className="text-sm text-[#908fa0]">
              Total
            </p>

            <p className="text-xl font-bold text-[#4cd7f6]">
              ₹
              {(
                quantity *
                unitPrice
              ).toLocaleString(
                'en-IN'
              )}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                loading
              }
              className="primary-gradient text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}