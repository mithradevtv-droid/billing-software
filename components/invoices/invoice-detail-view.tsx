'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, Printer, Download, Send, 
  Trash2, CheckCircle, Clock, Receipt,
  Building2, Phone, Mail, MapPin, Loader2,
  Hash, Calendar, CreditCard, FileCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/gst-calculator'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function InvoiceDetailView({ 
  invoice, 
  shop 
}: { 
  invoice: any
  shop: any
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(invoice.status)
  const invoiceRef = useRef<HTMLDivElement>(null)

  const subtotal = Number(invoice.subtotal) || 0
  const cgst = Number(invoice.cgst) || 0
  const sgst = Number(invoice.sgst) || 0
  const igst = Number(invoice.igst) || 0
  const totalTax = cgst + sgst + igst
  const total = Number(invoice.total) || 0
  const discount = Number(invoice.discount) || 0
  const isInterState = igst > 0
  const items = invoice.items || []
  console.log("INVOICE ITEMS", invoice.items)

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: newStatus,
          paid_amount: newStatus === 'Paid' ? total : 0
        })
        .eq('id', invoice.id)

      if (error) throw error
      setCurrentStatus(newStatus)
      toast.success(`Invoice marked as ${newStatus}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setUpdating(false)
    }
  }

  async function deleteInvoice() {
    if (!confirm(`Delete invoice ${invoice.invoice_number}?`)) return
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id)
      if (error) throw error
      toast.success('Invoice deleted')
      router.push('/invoices')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  async function downloadPDF() {
    if (!invoiceRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 10
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= (pdfHeight - 20)
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= (pdfHeight - 20)
      }
      
      pdf.save(`${invoice.invoice_number}.pdf`)
      toast.success('PDF downloaded!')
    } catch (err: any) {
      toast.error('Failed to generate PDF')
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  function shareInvoice() {
    const text = `📄 Tax Invoice ${invoice.invoice_number}\n\nFrom: ${shop.name}\nTo: ${invoice.customer?.name || 'Walk-in Customer'}\nAmount: ₹${total.toLocaleString('en-IN')}\nDate: ${format(new Date(invoice.date || invoice.created_at), 'dd MMM yyyy')}\nStatus: ${currentStatus}\n\n${shop.phone ? 'Contact: ' + shop.phone : ''}`
    
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoice_number}`,
        text: text,
      }).catch(() => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
      })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'Paid':
        return <Badge className="status-paid px-3 py-1 font-bold">✓ PAID</Badge>
      case 'Unpaid':
        return <Badge className="status-unpaid px-3 py-1 font-bold">! UNPAID</Badge>
      case 'Partially Paid':
        return <Badge className="status-partial px-3 py-1 font-bold">~ PARTIAL</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 midnight-card border-[#464554] rounded-xl">
        <Button 
          asChild 
          variant="ghost" 
          size="sm" 
          className="text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33]"
        >
          <Link href="/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {currentStatus !== 'Paid' && (
            <Button
              size="sm"
              onClick={() => updateStatus('Paid')}
              disabled={updating}
              className="bg-[#10b981] hover:bg-[#059669] text-white font-bold"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
            </Button>
          )}
          {currentStatus === 'Paid' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus('Unpaid')}
              disabled={updating}
              className="border-[#464554] text-[#c7c4d7] hover:bg-[#171f33]"
            >
              <Clock className="mr-2 h-4 w-4" /> Mark Unpaid
            </Button>
          )}

          <Button size="sm" variant="outline" onClick={() => window.print()}
            className="border-[#464554] text-[#c7c4d7] hover:bg-[#171f33] hover:border-[#4cd7f6]">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          
          <Button size="sm" variant="outline" onClick={downloadPDF} disabled={downloading}
            className="border-[#464554] text-[#c7c4d7] hover:bg-[#171f33] hover:border-[#4cd7f6]">
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            PDF
          </Button>
          
          <Button size="sm" variant="outline" onClick={shareInvoice}
            className="border-[#464554] text-[#c7c4d7] hover:bg-[#171f33] hover:border-[#4cd7f6]">
            <Send className="mr-2 h-4 w-4" /> Share
          </Button>

          <Button size="sm" variant="outline" onClick={deleteInvoice}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <div ref={invoiceRef}>
        <Card className="midnight-card border-[#464554] overflow-hidden print:bg-white">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0b1326] to-[#171f33] border-b border-[#464554] p-6 print:bg-white print:border-gray-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-[#4cd7f6]/30">
                  <Receipt className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-[#dae2fd] tracking-tight print:text-black">
                    TAX INVOICE
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Hash className="h-3 w-3 text-[#4cd7f6]" />
                    <p className="text-sm font-mono font-bold text-[#4cd7f6]">
                      {invoice.invoice_number}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(currentStatus)}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-[#c7c4d7] print:text-gray-700">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(invoice.date || invoice.created_at), 'dd MMM yyyy')}
                  </div>
                  {invoice.due_date && (
                    <p className="text-xs text-[#908fa0] mt-1">
                      Due: {format(new Date(invoice.due_date), 'dd MMM yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            {/* Shop & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* From (Shop) */}
              <div className="p-5 bg-[#0b1326] rounded-lg border-l-4 border-[#4cd7f6] print:bg-gray-50 print:border-blue-500">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-[#4cd7f6]" />
                  <p className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-widest">
                    From
                  </p>
                </div>
                <p className="font-bold text-[#dae2fd] text-lg print:text-black">
                  {shop.name}
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  {shop.address && (
                    <p className="text-[#c7c4d7] flex items-start gap-2 print:text-gray-700">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      {shop.address}
                    </p>
                  )}
                  <p className="text-[#c7c4d7] print:text-gray-700">
                    <span className="text-[#908fa0]">State:</span> {shop.state}
                  </p>
                  {shop.phone && (
                    <p className="text-[#c7c4d7] flex items-center gap-2 print:text-gray-700">
                      <Phone className="h-3 w-3" /> {shop.phone}
                    </p>
                  )}
                  {shop.gstin && (
                    <p className="font-mono text-[#4cd7f6] text-xs mt-2 pt-2 border-t border-[#464554]">
                      GSTIN: {shop.gstin}
                    </p>
                  )}
                </div>
              </div>

              {/* To (Customer) */}
              <div className="p-5 bg-[#0b1326] rounded-lg border-l-4 border-[#8083ff] print:bg-gray-50 print:border-purple-500">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="h-4 w-4 text-[#8083ff]" />
                  <p className="text-[10px] font-bold text-[#8083ff] uppercase tracking-widest">
                    Bill To
                  </p>
                </div>
                {invoice.customer ? (
                  <>
                    <p className="font-bold text-[#dae2fd] text-lg print:text-black">
                      {invoice.customer.name}
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-[#c7c4d7] flex items-center gap-2 print:text-gray-700">
                        <Phone className="h-3 w-3" /> {invoice.customer.phone}
                      </p>
                      {invoice.customer.state && (
                        <p className="text-[#c7c4d7] print:text-gray-700">
                          <span className="text-[#908fa0]">State:</span> {invoice.customer.state}
                        </p>
                      )}
                      {invoice.customer.gstin && (
                        <p className="font-mono text-[#8083ff] text-xs mt-2 pt-2 border-t border-[#464554]">
                          GSTIN: {invoice.customer.gstin}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-[#908fa0] italic">Walk-in Customer</p>
                )}
                <div className="mt-3 pt-3 border-t border-[#464554]">
                  <p className="text-xs text-[#908fa0]">
                    Supply: <span className="text-[#c7c4d7]">{invoice.billing_state}</span>
                  </p>
                  <p className="text-xs text-[#908fa0] mt-1">
                    Tax: <span className="text-[#4cd7f6] font-bold">
                      {isInterState ? 'IGST (Inter-state)' : 'CGST + SGST'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 overflow-hidden rounded-lg border border-[#464554]">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#4cd7f6]/10 to-[#8083ff]/10 border-b border-[#4cd7f6]">
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-[#4cd7f6] p-3 w-12">#</th>
                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-[#4cd7f6] p-3">Item Description</th>
                    <th className="text-center text-[10px] font-black uppercase tracking-widest text-[#4cd7f6] p-3 w-16">Qty</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-[#4cd7f6] p-3 w-24">Rate</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-[#4cd7f6] p-3 w-24">GST</th>
                    <th className="text-right text-[10px] font-black uppercase tracking-widest text-[#4cd7f6] p-3 w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#908fa0]">
                        No items in this invoice
                      </td>
                    </tr>
                  ) : (
                    items.map((item: any, idx: number) => (
                      <tr key={item.id || idx} className="border-b border-[#464554] hover:bg-[#0b1326] print:hover:bg-transparent">
                        <td className="p-3 text-sm text-[#908fa0] font-mono print:text-gray-600">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-[#dae2fd] print:text-black">
                            {item.product_name}
                          </p>
                          {item.sku && (
                            <p className="text-xs text-[#908fa0] font-mono mt-0.5">
                              SKU: {item.sku}
                            </p>
                          )}
                          {item.hsn_code && (
                            <p className="text-xs text-[#908fa0] mt-0.5">
                              HSN: {item.hsn_code}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-center text-sm font-mono font-bold text-[#dae2fd] print:text-black">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right text-sm font-mono text-[#dae2fd] print:text-black">
                          {formatCurrency(Number(item.unit_price))}
                        </td>
                        <td className="p-3 text-right text-sm font-mono print:text-gray-700">
                          <p className="text-[#c7c4d7] print:text-black">{item.gst_rate}%</p>
                          <p className="text-[10px] text-[#908fa0]">
                            {formatCurrency(Number(item.cgst) + Number(item.sgst) + Number(item.igst))}
                          </p>
                        </td>
                        <td className="p-3 text-right text-sm font-mono font-bold text-[#dae2fd] print:text-black">
                          {formatCurrency(Number(item.total))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-sm space-y-2 p-5 bg-[#0b1326] rounded-lg border border-[#464554] print:bg-gray-50 print:border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-[#c7c4d7] print:text-gray-700">Subtotal</span>
                  <span className="font-mono text-[#dae2fd] print:text-black">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c7c4d7] print:text-gray-700">Discount</span>
                    <span className="font-mono text-[#ef4444]">-{formatCurrency(discount)}</span>
                  </div>
                )}
                {cgst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c7c4d7] print:text-gray-700">CGST</span>
                    <span className="font-mono text-[#dae2fd] print:text-black">{formatCurrency(cgst)}</span>
                  </div>
                )}
                {sgst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c7c4d7] print:text-gray-700">SGST</span>
                    <span className="font-mono text-[#dae2fd] print:text-black">{formatCurrency(sgst)}</span>
                  </div>
                )}
                {igst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c7c4d7] print:text-gray-700">IGST</span>
                    <span className="font-mono text-[#dae2fd] print:text-black">{formatCurrency(igst)}</span>
                  </div>
                )}
                <div className="pt-3 border-t-2 border-double border-[#4cd7f6] flex justify-between items-center">
                  <span className="font-black text-[#dae2fd] print:text-black">GRAND TOTAL</span>
                  <span className="font-mono font-black text-2xl text-[#4cd7f6] print:text-black">
                    {formatCurrency(total)}
                  </span>
                </div>
                {currentStatus === 'Paid' && (
                  <div className="pt-2 border-t border-[#464554] flex justify-between text-sm">
                    <span className="text-[#10b981] font-bold">Amount Paid</span>
                    <span className="font-mono text-[#10b981] font-bold">
                      {formatCurrency(Number(invoice.paid_amount) || total)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-6 p-4 bg-[#0b1326] rounded-lg border-l-4 border-[#10b981] print:bg-gray-50">
                <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest mb-1">Notes</p>
                <p className="text-sm text-[#c7c4d7] print:text-gray-700">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-[#464554] pt-6 mt-8 text-center print:border-gray-300">
              <p className="text-xs text-[#908fa0] print:text-gray-600">
                This is a computer-generated invoice. No signature required.
              </p>
              <p className="text-xs text-[#4cd7f6] mt-1 font-bold">
                Thank you for your business! | Powered by BillMate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
