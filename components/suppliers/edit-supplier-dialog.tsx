'use client'

import { useState, useEffect } from 'react'
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

export function EditSupplierDialog({
  open,
  onOpenChange,
  supplier,
  onUpdated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: any
  onUpdated: (supplier: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] =
    useState('Kerala')

  useEffect(() => {
    if (supplier?.state) {
      setSelectedState(supplier.state)
    }
  }, [supplier])

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

      const updates = {
        name: fd.get('name'),
        phone,
        email: fd.get('email'),
        gstin: fd.get('gstin'),
        address: fd.get('address'),
        state: selectedState,
      }

      const supabase = createClient()

      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', supplier.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Supplier updated')

      onUpdated(data)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!supplier) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#171f33] border-[#464554] text-[#dae2fd] max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Supplier</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">

            <div>
              <Label>Name</Label>
              <Input
                name="name"
                defaultValue={supplier.name}
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                name="phone"
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                defaultValue={supplier.phone}
                placeholder="9876543210"
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                name="email"
                defaultValue={supplier.email}
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>

            <div>
              <Label>GSTIN</Label>
              <Input
                name="gstin"
                defaultValue={supplier.gstin}
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                name="address"
                defaultValue={supplier.address}
                className="bg-[#0b1326] border-[#464554]"
              />
            </div>

            <div>
              <Label>State</Label>

              <Select
                value={selectedState}
                onValueChange={setSelectedState}
              >
                <SelectTrigger className="bg-[#0b1326] border-[#464554]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="bg-[#171f33] border-[#464554]">
                  {[...INDIAN_STATES]
                    .sort()
                    .map((state) => (
                      <SelectItem
                        key={state}
                        value={state}
                      >
                        {state}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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