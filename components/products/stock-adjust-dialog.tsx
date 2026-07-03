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
import { Loader2 } from 'lucide-react'

export function StockAdjustDialog({
  open,
  onOpenChange,
  product,
  shopId,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  shopId: string
  onUpdated: (product: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [changeType, setChangeType] = useState('ADJUSTMENT')

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    if (!product) return

    setLoading(true)

    try {
      const fd = new FormData(e.currentTarget)

      const adjustment = Number(fd.get('quantity'))
      const notes = String(fd.get('notes') || '')

      const newStock =
        Number(product.current_stock) + adjustment

      if (newStock < 0) {
        toast.error('Stock cannot go below zero')
        setLoading(false)
        return
      }

      const supabase = createClient()

      const { data: updatedProduct, error } =
        await supabase
          .from('products')
          .update({
            current_stock: newStock,
          })
          .eq('id', product.id)
          .select()
          .single()

      if (error) throw error

      const { error: ledgerError } =
        await supabase
          .from('stock_ledger')
          .insert({
            shop_id: shopId,
            product_id: product.id,
            change_type: changeType,
            quantity: adjustment,
            notes,
          })

      if (ledgerError) throw ledgerError

      toast.success('Stock updated successfully')

      onUpdated(updatedProduct)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(
        err.message || 'Failed to update stock'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd]  overflow-visible">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 rounded-lg bg-[#0b1326]">
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-[#908fa0]">
            Current Stock: {product.current_stock}{' '}
            {product.unit}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">

            <div  className="space-y-2">
              <Label className="block mb-2">Change Type</Label>

              <Select
                value={changeType}
                onValueChange={setChangeType}
              >
                <SelectTrigger 
                className=" bg-[#0b1326] border-[#464554] text-white" >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent position="popper"  className="   bg-[#0b1326]    border-[#464554]    text-white " >
                  
                  <SelectItem value="ADJUSTMENT" >
                    Adjustment
                  </SelectItem>

                  <SelectItem value="PURCHASE" >  
                    Purchase
                  </SelectItem>

                  <SelectItem value="RETURN" >
                    Return
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="block mb-2">
                Quantity Change
              </Label>

              <Input
                type="number"
                name="quantity"
                required
                placeholder="Use 10 or -5"
              />
            </div>

            <div className="space-y-2">
              <Label className="block mb-2">Notes</Label>

              <Input
                name="notes"
                placeholder="Reason for stock adjustment"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
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
                  Updating...
                </>
              ) : (
                'Update Stock'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}