'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function AddProductDialog({
  open,
  onOpenChange,
  shopId,
  onAdded
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  onAdded: (product: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const fd = new FormData(e.currentTarget)
    const product = {
      name: fd.get('name') as string,
      sku: fd.get('sku') as string,
      category: (fd.get('category') as string) || null,
      hsn_code: (fd.get('hsn_code') as string) || null,
      purchase_price: Number(fd.get('purchase_price') || 0),
      selling_price: Number(fd.get('selling_price') || 0),
      gst_rate: Number(fd.get('gst_rate') || 18),
      current_stock: Number(fd.get('current_stock') || 0),
      low_stock_threshold: Number(fd.get('low_stock_threshold') || 5),
      unit: (fd.get('unit') as string) || 'pcs',
    }

    try {
      const supabase = createClient()
      let imageUrl: string | null = null

      if (imageFile) {
        const fileName =
          `${Date.now()}-${imageFile.name}`

      const { error: uploadError } =
          await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

       if (uploadError)
           throw uploadError

       const {
         data: { publicUrl },
        } = supabase.storage
         .from('product-images')
         .getPublicUrl(fileName)

        imageUrl = publicUrl
      }
      const { data, error } = await supabase
        .from('products')
        .insert({ ...product, shop_id: shopId, active: true, image_url: imageUrl })
        .select()
        .single()

      if (error) throw error

      toast.success('Product added successfully!')
      onAdded(data)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" name="name" required className="bg-[#0b1326] border-[#464554]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" name="sku" required className="bg-[#0b1326] border-[#464554] font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" className="bg-[#0b1326] border-[#464554]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hsn_code">HSN Code</Label>
              <Input id="hsn_code" name="hsn_code" className="bg-[#0b1326] border-[#464554] font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price *</Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                step="0.01"
                min="0"
                required
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_rate">GST Rate *</Label>
              <Select name="gst_rate" defaultValue="18" required>
                <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#171f33] border-[#464554]">
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                  <SelectItem value="28">28%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select name="unit" defaultValue="pcs">
                <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#171f33] border-[#464554]">
                  <SelectItem value="pcs">Pieces</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                  <SelectItem value="ltr">Liters</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="mtr">Meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_stock">Current Stock *</Label>
              <Input
                id="current_stock"
                name="current_stock"
                type="number"
                min="0"
                defaultValue="0"
                required
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
              <Input
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                min="0"
                defaultValue="5"
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">
              Product Image
            </Label>

            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageFile(
                       e.target.files?.[0] || null
                )
                }
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#464554]"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="primary-gradient text-white font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
