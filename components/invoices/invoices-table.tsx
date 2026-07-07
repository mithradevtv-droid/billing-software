'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { 
  Plus, Search, Receipt, Eye, Edit, Trash2, 
  MoreVertical, Download, Printer, Send,
  ArrowUpDown, Filter
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/gst-calculator'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import jsPDF from 'jspdf'

export function InvoicesTable({ initialInvoices }: { initialInvoices: any[] }) {
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = invoices.filter(inv => {
    const matchSearch = 
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  async function deleteInvoice(id: string, number: string) {
    if (!confirm(`Delete invoice ${number}? This cannot be undone.`)) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setInvoices(invoices.filter(inv => inv.id !== id))
      toast.success(`Invoice ${number} deleted`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    }
  }


  async function editInvoiceStatus(inv: any) {
    const nextStatus = window.prompt('Enter status: Paid, Partial, or Unpaid', inv.status || 'Unpaid')
    if (!nextStatus) return

    const normalized = nextStatus.trim()
    if (!['Paid', 'Partial', 'Unpaid'].includes(normalized)) {
      toast.error('Status must be Paid, Partial, or Unpaid')
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('invoices')
        .update({
          status: normalized,
          paid_amount: normalized === 'Paid' ? Number(inv.total || 0) : normalized === 'Unpaid' ? 0 : Number(inv.paid_amount || 0),
        })
        .eq('id', inv.id)

      if (error) throw error

      setInvoices(prev => prev.map(item => item.id === inv.id ? { ...item, status: normalized } : item))
      toast.success('Invoice updated')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update invoice')
    }
  }

  function downloadInvoicePDF(inv: any) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const date = format(new Date(inv.date || inv.created_at), 'dd MMM yyyy')
    const amount = formatCurrency(Number(inv.total || 0))

    doc.setFontSize(18)
    doc.text(`Invoice ${inv.invoice_number}`, 14, 18)
    doc.setFontSize(11)
    doc.text(`Customer: ${inv.customer?.name || 'Walk-in'}`, 14, 32)
    doc.text(`Phone: ${inv.customer?.phone || '-'}`, 14, 40)
    doc.text(`Date: ${date}`, 14, 48)
    doc.text(`Status: ${inv.status || '-'}`, 14, 56)
    doc.text(`Amount: ${amount}`, 14, 68)
    doc.text('Open the invoice detail page for the full tax invoice PDF.', 14, 84)

    doc.save(`${inv.invoice_number || 'invoice'}.pdf`)
    toast.success('PDF downloaded')
  }

  async function shareInvoice(inv: any) {
    const text = `Invoice ${inv.invoice_number}\nCustomer: ${inv.customer?.name || 'Walk-in'}\nAmount: ${formatCurrency(Number(inv.total || 0))}\nStatus: ${inv.status || '-'}\nDate: ${format(new Date(inv.date || inv.created_at), 'dd MMM yyyy')}`

    try {
      if (navigator.share) {
        await navigator.share({ title: `Invoice ${inv.invoice_number}`, text })
      } else {
        await navigator.clipboard.writeText(text)
        toast.success('Invoice details copied')
      }
    } catch {
      await navigator.clipboard.writeText(text)
      toast.success('Invoice details copied')
    }
  }
  function getStatusBadge(status: string) {
    switch (status) {
      case 'Paid':
        return <Badge className="status-paid text-[10px] font-bold">✓ Paid</Badge>
      case 'Unpaid':
        return <Badge className="status-unpaid text-[10px] font-bold">! Unpaid</Badge>
      case 'Partial':
      case 'Partially Paid':
        return <Badge className="status-partial text-[10px] font-bold">~ Partial</Badge>
      default:
        return <Badge className="status-draft text-[10px] font-bold">{status}</Badge>
    }
  }

  // Stats
  const totalAmount = filtered.reduce((sum, inv) => sum + Number(inv.total || 0), 0)
  const paidAmount = filtered.filter(i => i.status === 'Paid').reduce((s, i) => s + Number(i.total || 0), 0)
  const unpaidAmount = filtered.filter(i => i.status === 'Unpaid' || i.status === 'Partial' || i.status === 'Partially Paid').reduce((s, i) => s + Number(i.total || 0), 0)

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#dae2fd]">
            Invoices
          </h1>
          <p className="text-sm text-[#c7c4d7]">
            {invoices.length} total invoices
          </p>
        </div>
        <Button asChild className="primary-gradient text-white font-bold uppercase tracking-wider text-xs">
          <Link href="/billing">
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-3 stagger">
        <div className="midnight-card rounded-xl p-4">
          <p className="text-[10px] text-[#908fa0] font-bold uppercase tracking-widest">Total</p>
          <p className="text-xl font-bold text-[#dae2fd] mt-1 tabular-nums">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="midnight-card rounded-xl p-4">
          <p className="text-[10px] text-[#10b981] font-bold uppercase tracking-widest">Paid</p>
          <p className="text-xl font-bold text-[#10b981] mt-1 tabular-nums">
            {formatCurrency(paidAmount)}
          </p>
        </div>
        <div className="midnight-card rounded-xl p-4">
          <p className="text-[10px] text-[#ef4444] font-bold uppercase tracking-widest">Unpaid</p>
          <p className="text-xl font-bold text-[#ef4444] mt-1 tabular-nums">
            {formatCurrency(unpaidAmount)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="midnight-card border-[#464554]">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0]" />
              <Input
                placeholder="Search invoice number or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-1 flex-wrap">
              {['all', 'Paid', 'Unpaid', 'Partial'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? 'primary-gradient text-white text-xs font-bold'
                      : 'border-[#464554] text-[#c7c4d7] hover:border-[#4cd7f6] text-xs'
                  }
                >
                  {status === 'all' ? 'All' : status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="midnight-card border-[#464554] overflow-hidden">
        <CardHeader className="border-b border-[#464554]">
          <CardTitle className="text-base font-bold text-[#dae2fd]">
            All Invoices ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#c7c4d7]">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{search ? 'No invoices found' : 'No invoices yet'}</p>
              <Button asChild className="primary-gradient mt-4 text-white font-bold">
                <Link href="/billing">
                  <Plus className="mr-2 h-4 w-4" /> Create First Invoice
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#464554] bg-[#0b1326]">
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4">
                      Invoice
                    </th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4 hidden md:table-cell">
                      Customer
                    </th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4 hidden lg:table-cell">
                      Date
                    </th>
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4">
                      Status
                    </th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4">
                      Amount
                    </th>
                    <th className="text-center text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4 w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, idx) => (
                    <tr 
                      key={inv.id} 
                      className="border-b border-[#464554] last:border-0 hover:bg-[#222a3d] transition-colors group animate-in"
                      style={{ animationDelay: `${idx * 0.02}s` }}
                    >
                      {/* Invoice # */}
                      <td className="p-4">
                        <div>
                          <Link 
                            href={`/invoices/${inv.id}`} 
                            className="font-mono text-sm font-medium text-[#4cd7f6] hover:text-[#dae2fd] hover:underline"
                          >
                            {inv.invoice_number}
                          </Link>
                          <p className="text-[10px] text-[#908fa0] md:hidden mt-0.5">
                            {format(new Date(inv.date || inv.created_at), 'dd MMM')}
                          </p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4 text-sm text-[#c7c4d7] hidden md:table-cell">
                        <div>
                          <p className="font-medium text-[#dae2fd]">
                            {inv.customer?.name || 'Walk-in'}
                          </p>
                          {inv.customer?.phone && (
                            <p className="text-xs text-[#908fa0]">{inv.customer.phone}</p>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-sm text-[#c7c4d7] hidden lg:table-cell">
                        {format(new Date(inv.date || inv.created_at), 'dd MMM yyyy')}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {getStatusBadge(inv.status)}
                      </td>

                      {/* Amount */}
                      <td className="p-4 text-right">
                        <p className="font-mono font-bold text-sm text-[#dae2fd] tabular-nums">
                          {formatCurrency(Number(inv.total))}
                        </p>
                        {inv.cgst > 0 && (
                          <p className="text-[10px] text-[#908fa0] font-mono">
                            GST: {formatCurrency(Number(inv.cgst) + Number(inv.sgst) + Number(inv.igst))}
                          </p>
                        )}
                      </td>

                      {/* Actions - VIEW BUTTON HERE */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* VIEW BUTTON - Primary Action */}
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-[#4cd7f6] hover:bg-[#4cd7f6]/10 hover:text-[#4cd7f6]"
                            title="View Invoice"
                          >
                            <Link href={`/invoices/${inv.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>

                          {/* EDIT BUTTON */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-[#c7c4d7] hover:bg-[#171f33] hover:text-[#dae2fd]"
                            title="Edit"
                            onClick={() => editInvoiceStatus(inv)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* MORE OPTIONS DROPDOWN */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-[#c7c4d7] hover:bg-[#171f33] hover:text-[#dae2fd]"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end"
                              className="bg-[#171f33] border-[#464554] text-[#dae2fd]"
                            >
                              <DropdownMenuItem 
                                asChild
                                className="text-[#dae2fd]"
                              >
                                <Link href={`/invoices/${inv.id}`} className="border-[#464554] text-[#dae2fd]">
                                  <Eye className="mr-2 h-4 w-4" /> View Invoice
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => window.print()}
                                className="bg-[#171f33] border-[#464554] text-[#dae2fd]"
                              >
                                <Printer className="mr-2 h-4 w-4" /> Print
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => downloadInvoicePDF(inv)}
                                className="bg-[#171f33] border-[#464554] text-[#dae2fd"
                              >
                                <Download className="mr-2 h-4 w-4" /> Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => shareInvoice(inv)}
                                className="bg-[#171f33] border-[#464554] text-[#dae2fd"
                              >
                                <Send className="mr-2 h-4 w-4" /> Share / Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#464554]" />
                              <DropdownMenuItem 
                                onClick={() => deleteInvoice(inv.id, inv.invoice_number)}
                                className="text-[#ef4444] hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
