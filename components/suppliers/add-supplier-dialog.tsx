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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { INDIAN_STATES } from '@/lib/gst-calculator'

export function AddSupplierDialog({
  open,
  onOpenChange,
  shopId,
  onAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopId: string
  onAdded: (supplier: any) => void
}) {
  const [loading, setLoading] = useState(false)

  const [selectedState, setSelectedState] =
    useState('Kerala')

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setLoading(true)

    try {
      const fd = new FormData(e.currentTarget)

      const phone = String(fd.get('phone'))

      if (!/^\d{10}$/.test(phone)) {
        toast.error(
          'Mobile number must be exactly 10 digits'
        )
        setLoading(false)
        return
      }

      const supplier = {
        name: fd.get('name') as string,
        phone,
        email:
          (fd.get('email') as string) || null,
        gstin:
          (fd.get('gstin') as string) || null,
        address:
          (fd.get('address') as string) || null,
        state: selectedState,
      }

      const supabase = createClient()

      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplier,
          shop_id: shopId,
        })
        .select()
        .single()

      if (error) throw error

      toast.success(
        'Supplier added successfully'
      )

      onAdded(data)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(
        err.message ||
          'Failed to add supplier'
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
            Add Supplier
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              name="name"
              required
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              name="phone"
              type="tel"
              required
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="9876543210"
              title="Enter a valid 10-digit mobile number"
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div className="space-y-2">
            <Label>GSTIN</Label>
            <Input
              name="gstin"
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              name="address"
              className="bg-[#0b1326] border-[#464554]"
            />
          </div>

          <div className="space-y-2">
            <Label>State *</Label>

            <Select
              value={selectedState}
              onValueChange={
                setSelectedState
              }
            >
              <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="bg-[#171f33] border-[#464554]">
                {INDIAN_STATES.map(
                  (state) => (
                    <SelectItem
                      key={state}
                      value={state}
                    >
                      {state}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="primary-gradient text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Supplier'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}