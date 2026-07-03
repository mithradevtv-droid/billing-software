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
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  onUpdated: (product: any) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    try {
      const supabase = createClient()

      const updates = {
        name: fd.get('name'),
        sku: fd.get('sku'),
        category: fd.get('category'),
        hsn_code: fd.get('hsn_code'),
        purchase_price: Number(fd.get('purchase_price')),
        selling_price: Number(fd.get('selling_price')),
        gst_rate: Number(fd.get('gst_rate')),
        current_stock: Number(fd.get('current_stock')),
        low_stock_threshold: Number(
          fd.get('low_stock_threshold')
        ),
        unit: fd.get('unit'),
        barcode: fd.get('barcode'),
      }

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Product updated')
      onUpdated(data)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">

            <div>
              <Label>Name</Label>
              <Input
                name="name"
                defaultValue={product.name}
              />
            </div>

            <div>
              <Label>SKU</Label>
              <Input
                name="sku"
                defaultValue={product.sku}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input
                name="category"
                defaultValue={product.category}
              />
            </div>

            <div>
              <Label>HSN</Label>
              <Input
                name="hsn_code"
                defaultValue={product.hsn_code}
              />
            </div>

            <div>
              <Label>Purchase Price</Label>
              <Input
                type="number"
                name="purchase_price"
                defaultValue={product.purchase_price}
              />
            </div>

            <div>
              <Label>Selling Price</Label>
              <Input
                type="number"
                name="selling_price"
                defaultValue={product.selling_price}
              />
            </div>

            <div>
              <Label>GST %</Label>
              <Input
                type="number"
                name="gst_rate"
                defaultValue={product.gst_rate}
              />
            </div>

            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                name="current_stock"
                defaultValue={product.current_stock}
              />
            </div>

            <div>
              <Label>Low Stock Alert</Label>
              <Input
                type="number"
                name="low_stock_threshold"
                defaultValue={
                  product.low_stock_threshold
                }
              />
            </div>

            <div>
              <Label>Unit</Label>
              <Input
                name="unit"
                defaultValue={product.unit}
              />
            </div>

            <div className="col-span-2">
              <Label>Barcode</Label>
              <Input
                name="barcode"
                defaultValue={product.barcode}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
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