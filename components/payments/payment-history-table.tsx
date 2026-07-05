"use client"

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trash2, Search, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { deletePaymentAction } from '@/app/(dashboard)/payments/actions'

interface PaymentHistoryTableProps {
  payments: any[]
  shopId: string
}

export function PaymentHistoryTable({ payments, shopId }: PaymentHistoryTableProps) {
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState('')

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  function getMethodIcon(method: string) {
    const icons: Record<string, string> = {
      cash: '💵',
      upi: '📱',
      card: '💳',
      bank_transfer: '🏦',
      cheque: '📝',
      other: '🔖'
    }
    return icons[method] || '💰'
  }

  function handleDelete(paymentId: string) {
    if (!confirm('Are you sure you want to delete this payment?')) return

    startTransition(async () => {
      const result = await deletePaymentAction(paymentId, shopId)
      
      if (result.success) {
        toast.success('Payment deleted')
      } else {
        toast.error(result.error || 'Failed to delete payment')
      }
    })
  }

  const filteredPayments = payments.filter(p => 
    p.payment_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice?.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice?.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_number?.toLowerCase().includes(search.toLowerCase())
  )

  if (payments.length === 0) {
    return (
      <Card className="bg-[#0e1421] border-[#171f33]">
        <CardContent className="p-12 text-center">
          <CreditCard className="h-16 w-16 text-[#464554] mx-auto" />
          <p className="text-[#dae2fd] mt-4 font-medium">No payments recorded yet</p>
          <p className="text-sm text-[#c7c4d7] mt-1">Record your first payment to see it here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0e1421] border-[#171f33]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[#dae2fd]">Payment History</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#464554]" />
          <Input
            type="text"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0a0f1a] border-[#171f33] text-[#dae2fd]"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-[#171f33] hover:bg-transparent">
              <TableHead className="text-[#c7c4d7] uppercase text-xs tracking-wider">Payment #</TableHead>
              <TableHead className="text-[#c7c4d7] uppercase text-xs tracking-wider">Invoice</TableHead>
              <TableHead className="text-[#c7c4d7] uppercase text-xs tracking-wider">Customer</TableHead>
              <TableHead className="text-[#c7c4d7] uppercase text-xs tracking-wider">Date</TableHead>
              <TableHead className="text-[#c7c4d7] uppercase text-xs tracking-wider">Method</TableHead>
              <TableHead className="text-[#c7c4d7] uppercase text-xs tracking-wider text-right">Amount</TableHead>
              <TableHead className="text-[#c7c4d7] uppercase text-xs tracking-wider w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id} className="border-[#171f33] hover:bg-[#0a0f1a]">
                <TableCell className="font-mono text-sm font-bold text-[#dae2fd]">
                  {payment.payment_number}
                </TableCell>
                <TableCell className="text-[#c7c4d7] text-sm">
                  {payment.invoice?.invoice_number || '-'}
                </TableCell>
                <TableCell className="text-[#c7c4d7] text-sm">
                  {payment.invoice?.customer?.name || '-'}
                </TableCell>
                <TableCell className="text-[#c7c4d7] text-sm">
                  {payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM yyyy') : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-[#464554] text-[#c7c4d7]">
                    {getMethodIcon(payment.payment_method)} {payment.payment_method}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold text-[#3ddc97]">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(payment.id)}
                    disabled={pending}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
