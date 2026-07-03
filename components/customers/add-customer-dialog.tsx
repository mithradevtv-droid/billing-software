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
import { INDIAN_STATES } from '@/lib/gst-calculator'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function AddCustomerDialog({
  open,
  onOpenChange,
  shopId,
  onAdded
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  onAdded: (customer: any) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const fd = new FormData(e.currentTarget)
    const customer = {
      name: fd.get('name') as string,
      phone: fd.get('phone') as string,
      email: (fd.get('email') as string) || null,
      gstin: (fd.get('gstin') as string) || null,
      address: (fd.get('address') as string) || null,
      state: fd.get('state') as string,
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('customers')
        .insert({ ...customer, shop_id: shopId })
        .select()
        .single()

      if (error) throw error

      toast.success('Customer added successfully!')
      onAdded(data)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd] max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Customer name"
              className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              required
              placeholder="9876543210"
              className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select name="state" required>
              <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="bg-[#171f33] border-[#464554] max-h-[200px]">
                {INDIAN_STATES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="customer@example.com"
              className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN (optional)</Label>
            <Input
              id="gstin"
              name="gstin"
              placeholder="29ABCDE1234F1Z5"
              className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              name="address"
              placeholder="City, State"
              className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
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
                'Add Customer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
