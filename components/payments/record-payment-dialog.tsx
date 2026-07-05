"use client"

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { recordPaymentAction } from '@/app/(dashboard)/payments/actions'

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: any | null
  invoices: any[]
  shopId: string
}

export function RecordPaymentDialog({ open, onOpenChange, invoice: initialInvoice, invoices, shopId }: RecordPaymentDialogProps) {
  const [pending, startTransition] = useTransition()
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(initialInvoice?.id || '')
  const [amount, setAmount] = useState(initialInvoice?.outstanding_amount?.toString() || '')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')

  const selectedInvoice = initialInvoice || invoices.find(inv => inv.id === selectedInvoiceId)
  const outstanding = selectedInvoice?.outstanding_amount || 0

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!selectedInvoice) {
      toast.error('Please select an invoice')
      return
    }

    const paymentAmount = parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (paymentAmount > outstanding) {
      toast.error(`Amount cannot exceed outstanding ₹${outstanding}`)
      return
    }

    const formData = new FormData()
    formData.append('shop_id', shopId)
    formData.append('invoice_id', selectedInvoice.id)
    formData.append('amount', paymentAmount.toString())
    formData.append('payment_method', paymentMethod)
    formData.append('payment_date', paymentDate)
    formData.append('reference_number', referenceNumber)
    formData.append('notes', notes)

    startTransition(async () => {
      const result = await recordPaymentAction(formData)
      
      if (result.success) {
        toast.success('Payment recorded successfully! 🎉')
        // Reset form
        setAmount('')
        setReferenceNumber('')
        setNotes('')
        setPaymentMethod('cash')
        onOpenChange(false)
      } else {
        toast.error(result.error || 'Failed to record payment')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0e1421] border-[#171f33] text-[#dae2fd] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
            <CreditCard className="h-5 w-5 text-[#4cd7f6]" />
            Record Payment
          </DialogTitle>
          <DialogDescription className="text-[#c7c4d7]">
            Record a payment received from customer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invoice Selection */}
          {!initialInvoice && (
            <div className="space-y-2">
              <Label className="text-[#dae2fd]">Select Invoice *</Label>
              <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                <SelectTrigger className="bg-[#0a0f1a] border-[#171f33] text-[#dae2fd]">
                  <SelectValue placeholder="Choose an invoice" />
                </SelectTrigger>
                <SelectContent className="bg-[#0e1421] border-[#171f33] text-[#dae2fd]">
                  {invoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.invoice_number} - {inv.customer?.name} (₹{inv.outstanding_amount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Invoice Info */}
          {selectedInvoice && (
            <div className="bg-[#0a0f1a] border border-[#171f33] rounded-lg p-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[#464554] text-xs uppercase tracking-wider">Invoice</p>
                  <p className="text-[#dae2fd] font-mono font-bold mt-1">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-[#464554] text-xs uppercase tracking-wider">Total</p>
                  <p className="text-[#dae2fd] font-bold mt-1">₹{selectedInvoice.total}</p>
                </div>
                <div>
                  <p className="text-[#464554] text-xs uppercase tracking-wider">Outstanding</p>
                  <p className="text-[#ffce50] font-bold mt-1">₹{outstanding}</p>
                </div>
              </div>
            </div>
          )}

          {/* Amount & Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#dae2fd]">Amount (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={outstanding}
                required
                className="bg-[#0a0f1a] border-[#171f33] text-[#dae2fd]"
                placeholder="0.00"
              />
              {outstanding > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(outstanding.toString())}
                  className="text-xs text-[#4cd7f6] hover:underline"
                >
                  Pay full outstanding: ₹{outstanding}
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[#dae2fd]">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-[#0a0f1a] border-[#171f33] text-[#dae2fd]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0e1421] border-[#171f33] text-[#dae2fd]">
                  <SelectItem value="cash">💵 Cash</SelectItem>
                  <SelectItem value="upi">📱 UPI</SelectItem>
                  <SelectItem value="card">💳 Card</SelectItem>
                  <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                  <SelectItem value="cheque">📝 Cheque</SelectItem>
                  <SelectItem value="other">🔖 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Reference */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#dae2fd]">Payment Date *</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="bg-[#0a0f1a] border-[#171f33] text-[#dae2fd]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#dae2fd]">Reference Number</Label>
              <Input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Transaction ID, Cheque #, etc."
                className="bg-[#0a0f1a] border-[#171f33] text-[#dae2fd]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-[#dae2fd]">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="bg-[#0a0f1a] border-[#171f33] text-[#dae2fd]"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="border-[#464554] text-[#dae2fd]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="primary-gradient text-white"
            >
              {pending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
