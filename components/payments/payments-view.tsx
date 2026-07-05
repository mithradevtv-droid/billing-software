"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  CreditCard, TrendingUp, AlertCircle, CheckCircle2, Plus, 
  Receipt, IndianRupee, ArrowUpRight, Wallet,
  Clock, Building2, Hash, Search,
  Banknote, Smartphone, CreditCard as CardIcon, Building, FileText, MoreHorizontal
} from 'lucide-react'
import { RecordPaymentDialog } from './record-payment-dialog'

interface PaymentsViewProps {
  invoices: any[]
  pendingInvoices: any[]
  payments: any[]
  stats: any
  methodsBreakdown?: any
  shopId: string
}

// ============================================
// PAYMENT METHOD CARD COMPONENT
// ============================================
function PaymentMethodCard({ 
  icon: Icon, 
  label, 
  color, 
  count, 
  amount, 
  total 
}: { 
  icon: any
  label: string
  color: 'emerald' | 'sky' | 'purple' | 'blue' | 'amber' | 'gray'
  count: number
  amount: number
  total: number
}) {
  const percentage = total > 0 ? Math.round((amount / total) * 100) : 0
  
  const colorClasses: Record<string, { bg: string, text: string, border: string, bar: string }> = {
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400'
    },
    sky: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      border: 'border-sky-500/20',
      bar: 'bg-gradient-to-r from-sky-500 to-sky-400'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      bar: 'bg-gradient-to-r from-purple-500 to-purple-400'
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      bar: 'bg-gradient-to-r from-blue-500 to-blue-400'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      bar: 'bg-gradient-to-r from-amber-500 to-amber-400'
    },
    gray: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-400',
      border: 'border-gray-500/20',
      bar: 'bg-gradient-to-r from-gray-500 to-gray-400'
    }
  }
  
  const classes = colorClasses[color]
  
  return (
    <div className={`p-4 rounded-xl border ${classes.border} ${classes.bg} hover:scale-105 transition-transform cursor-pointer`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`h-8 w-8 rounded-lg ${classes.bg} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${classes.text}`} />
        </div>
        <span className={`text-[10px] font-bold ${classes.text} uppercase tracking-wider`}>
          {percentage}%
        </span>
      </div>
      
      <p className="text-xs text-[#908fa0] uppercase tracking-wider font-medium mb-1">
        {label}
      </p>
      <p className="text-lg font-bold text-[#dae2fd]">
        {amount > 0 ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(amount) : '₹0'}
      </p>
      
      <div className="mt-2 h-1 bg-[#171f33] rounded-full overflow-hidden">
        <div 
          className={`h-full ${classes.bar} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="text-[10px] text-[#908fa0] mt-2">
        {count} transaction{count !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export function PaymentsView({ invoices, pendingInvoices, payments, stats, methodsBreakdown, shopId }: PaymentsViewProps) {
  const [showRecordDialog, setShowRecordDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit',
      month: 'short', 
      year: 'numeric'
    })
  }

  function handleRecordPayment(invoice: any) {
    setSelectedInvoice(invoice)
    setShowRecordDialog(true)
  }

  function getStatusConfig(status: string) {
    const s = status?.toLowerCase()
    if (s === 'paid') return {
      label: 'Paid',
      className: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      dot: 'bg-emerald-400'
    }
    if (s === 'partial') return {
      label: 'Partial',
      className: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
      dot: 'bg-sky-400'
    }
    return {
      label: 'Unpaid',
      className: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      dot: 'bg-amber-400'
    }
  }

  const collectionRate = stats.totalInvoices > 0 
    ? Math.round(((stats.totalInvoices - stats.unpaidInvoices) / stats.totalInvoices) * 100) 
    : 0

  const filteredPayments = payments.filter(p => 
    p.payment_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.invoice?.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.invoice?.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.reference_number?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <div className="w-full space-y-6 animate-in pb-8">
      
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#4cd7f6] to-[#8083ff] flex items-center justify-center">
              <Wallet className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-xs font-medium text-[#4cd7f6] uppercase tracking-widest">
              PAYMENTS
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
            Payments
          </h1>
          <p className="text-sm text-[#908fa0] mt-0.5">
            Track collections, outstanding dues & history
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedInvoice(null)
            setShowRecordDialog(true)
          }}
          className="primary-gradient text-white font-semibold h-10 px-4 shadow-lg shadow-[#4cd7f6]/20 whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" /> New Payment
        </Button>
      </div>

      {/* ==================== STATS GRID ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0e1421] border-[#171f33] hover:border-emerald-500/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-[#908fa0] uppercase tracking-wider font-bold">Today</p>
              <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-[#dae2fd]">
              {formatCurrency(stats.todayPayments)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0e1421] border-[#171f33] hover:border-sky-500/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-[#908fa0] uppercase tracking-wider font-bold">This Month</p>
              <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <p className="text-2xl font-bold text-[#dae2fd]">
              {formatCurrency(stats.monthPayments)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0e1421] border-[#171f33] hover:border-amber-500/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-[#908fa0] uppercase tracking-wider font-bold">Outstanding</p>
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">
              {formatCurrency(stats.outstanding)}
            </p>
            <p className="text-[10px] text-[#908fa0] mt-1">
              {stats.unpaidInvoices} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0e1421] border-[#171f33] hover:border-purple-500/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-[#908fa0] uppercase tracking-wider font-bold">Collection Rate</p>
              <Receipt className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-[#dae2fd]">
              {collectionRate}%
            </p>
            <div className="mt-2 h-1 bg-[#171f33] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== PAYMENT METHODS BREAKDOWN ==================== */}
      {methodsBreakdown && methodsBreakdown.total > 0 && (
        <Card className="bg-[#0e1421] border-[#171f33] overflow-hidden">
          <div className="p-5 border-b border-[#171f33]">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-[10px] text-[#4cd7f6] uppercase tracking-widest font-bold">
                  Payment Methods
                </p>
                <h3 className="text-lg font-bold text-[#dae2fd] mt-1">Last 30 Days Breakdown</h3>
              </div>
              <Badge variant="outline" className="border-[#4cd7f6]/30 text-[#4cd7f6]">
                Total: {formatCurrency(methodsBreakdown.total)}
              </Badge>
            </div>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <PaymentMethodCard
                icon={Banknote}
                label="Cash"
                color="emerald"
                count={methodsBreakdown.cash.count}
                amount={methodsBreakdown.cash.amount}
                total={methodsBreakdown.total}
              />
              
              <PaymentMethodCard
                icon={Smartphone}
                label="UPI"
                color="sky"
                count={methodsBreakdown.upi.count}
                amount={methodsBreakdown.upi.amount}
                total={methodsBreakdown.total}
              />
              
              <PaymentMethodCard
                icon={CardIcon}
                label="Card"
                color="purple"
                count={methodsBreakdown.card.count}
                amount={methodsBreakdown.card.amount}
                total={methodsBreakdown.total}
              />
              
              <PaymentMethodCard
                icon={Building}
                label="Bank"
                color="blue"
                count={methodsBreakdown.bank_transfer.count}
                amount={methodsBreakdown.bank_transfer.amount}
                total={methodsBreakdown.total}
              />
              
              <PaymentMethodCard
                icon={FileText}
                label="Cheque"
                color="amber"
                count={methodsBreakdown.cheque.count}
                amount={methodsBreakdown.cheque.amount}
                total={methodsBreakdown.total}
              />
              
              <PaymentMethodCard
                icon={MoreHorizontal}
                label="Other"
                color="gray"
                count={methodsBreakdown.other.count}
                amount={methodsBreakdown.other.amount}
                total={methodsBreakdown.total}
              />
            </div>
          </div>
        </Card>
      )}

      {/* ==================== TABS ==================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList 
          className="bg-[#0e1421] border border-[#171f33] p-1 inline-flex h-auto"
          style={{ 
            display: 'inline-flex',
            flexDirection: 'row',
            gap: '0.25rem',
            width: 'auto',
            height: 'auto'
          }}
        >
          <TabsTrigger 
            value="pending"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#4cd7f6]/20 flex items-center gap-2 px-4 py-2 rounded-md"
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="font-semibold text-sm">Pending</span>
            {pendingInvoices.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold min-w-[18px] text-center">
                {pendingInvoices.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#4cd7f6]/20 flex items-center gap-2 px-4 py-2 rounded-md"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span className="font-semibold text-sm">All Invoices</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold min-w-[18px] text-center">
              {invoices.length}
            </span>
          </TabsTrigger>

          <TabsTrigger 
            value="history"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4cd7f6] data-[state=active]:to-[#8083ff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#4cd7f6]/20 flex items-center gap-2 px-4 py-2 rounded-md"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span className="font-semibold text-sm">History</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold min-w-[18px] text-center">
              {payments.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ==================== PENDING TAB ==================== */}
        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingInvoices.length === 0 ? (
            <Card className="bg-[#0e1421] border-[#171f33]">
              <CardContent className="p-16 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#dae2fd]">All caught up!</h3>
                <p className="text-sm text-[#908fa0] mt-1">No pending payments at the moment</p>
              </CardContent>
            </Card>
          ) : (
            pendingInvoices.map((invoice, index) => {
              const status = getStatusConfig(invoice.status)
              const progress = invoice.total > 0 
                ? Math.round((invoice.paid_amount / invoice.total) * 100) 
                : 0
              return (
                <Card 
                  key={invoice.id} 
                  className="bg-[#0e1421] border-[#171f33] hover:border-[#4cd7f6]/40 transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3.5 w-3.5 text-[#4cd7f6]" />
                            <p className="font-mono text-sm font-bold text-[#dae2fd]">
                              {invoice.invoice_number}
                            </p>
                          </div>
                          <Badge variant="outline" className={`${status.className} flex items-center gap-1.5`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-[#908fa0]" />
                          <span className="text-[#c7c4d7]">
                            {invoice.customer?.name || 'Walk-in Customer'}
                          </span>
                          {invoice.customer?.phone && (
                            <span className="text-[#908fa0]">• {invoice.customer.phone}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3 p-3 bg-[#0a0f1a] rounded-lg border border-[#171f33]">
                          <div>
                            <p className="text-[10px] text-[#908fa0] uppercase tracking-wider font-medium">Total</p>
                            <p className="text-sm font-bold text-[#dae2fd] mt-0.5">{formatCurrency(invoice.total)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-medium">Paid</p>
                            <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(invoice.paid_amount)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-amber-400 uppercase tracking-wider font-medium">Due</p>
                            <p className="text-sm font-bold text-amber-400 mt-0.5">{formatCurrency(invoice.outstanding_amount)}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#908fa0] font-medium">{progress}% Collected</span>
                            <span className="text-[#908fa0]">{formatCurrency(invoice.outstanding_amount)} remaining</span>
                          </div>
                          <div className="h-1.5 bg-[#171f33] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleRecordPayment(invoice)}
                        className="primary-gradient text-white font-semibold h-10 px-4 shadow-lg shadow-[#4cd7f6]/20 whitespace-nowrap"
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> 
                        Record Payment
                        <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* ==================== ALL INVOICES TAB ==================== */}
        <TabsContent value="all" className="mt-4">
          {invoices.length === 0 ? (
            <Card className="bg-[#0e1421] border-[#171f33]">
              <CardContent className="p-16 text-center">
                <Receipt className="h-12 w-12 text-[#464554] mx-auto" />
                <p className="text-[#dae2fd] mt-4 font-medium">No invoices yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#0e1421] border-[#171f33] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#171f33] bg-[#0a0f1a]">
                      <th className="text-left p-4 text-[10px] font-bold text-[#908fa0] uppercase tracking-wider">Invoice</th>
                      <th className="text-left p-4 text-[10px] font-bold text-[#908fa0] uppercase tracking-wider">Customer</th>
                      <th className="text-right p-4 text-[10px] font-bold text-[#908fa0] uppercase tracking-wider">Total</th>
                      <th className="text-right p-4 text-[10px] font-bold text-[#908fa0] uppercase tracking-wider">Paid</th>
                      <th className="text-right p-4 text-[10px] font-bold text-[#908fa0] uppercase tracking-wider">Due</th>
                      <th className="text-center p-4 text-[10px] font-bold text-[#908fa0] uppercase tracking-wider">Status</th>
                      <th className="text-right p-4 text-[10px] font-bold text-[#908fa0] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => {
                      const status = getStatusConfig(invoice.status)
                      return (
                        <tr 
                          key={invoice.id} 
                          className="border-b border-[#171f33] hover:bg-[#0a0f1a]/50 transition-colors"
                        >
                          <td className="p-4">
                            <p className="font-mono text-sm font-bold text-[#dae2fd]">
                              {invoice.invoice_number}
                            </p>
                            <p className="text-xs text-[#908fa0] mt-0.5">
                              {formatDate(invoice.date)}
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-[#dae2fd]">
                              {invoice.customer?.name || 'Walk-in'}
                            </p>
                            {invoice.customer?.phone && (
                              <p className="text-xs text-[#908fa0] mt-0.5">{invoice.customer.phone}</p>
                            )}
                          </td>
                          <td className="p-4 text-right font-mono text-sm text-[#dae2fd]">
                            {formatCurrency(invoice.total)}
                          </td>
                          <td className="p-4 text-right font-mono text-sm text-emerald-400 font-semibold">
                            {formatCurrency(invoice.paid_amount)}
                          </td>
                          <td className="p-4 text-right font-mono text-sm text-amber-400 font-semibold">
                            {formatCurrency(invoice.outstanding_amount)}
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className={status.className}>
                              <span className={`h-1.5 w-1.5 rounded-full ${status.dot} mr-1.5`} />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            {invoice.outstanding_amount > 0 ? (
                              <Button
                                size="sm"
                                onClick={() => handleRecordPayment(invoice)}
                                className="bg-[#4cd7f6]/10 text-[#4cd7f6] hover:bg-[#4cd7f6] hover:text-[#0a0f1a] border border-[#4cd7f6]/30 h-8"
                              >
                                <CreditCard className="h-3 w-3 mr-1" /> Pay
                              </Button>
                            ) : (
                              <span className="text-xs text-emerald-400 font-semibold">✓ Settled</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ==================== HISTORY TAB ==================== */}
        <TabsContent value="history" className="mt-4 space-y-3">
          <Card className="bg-[#0e1421] border-[#171f33]">
            <div className="p-4 border-b border-[#171f33] flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-semibold text-[#dae2fd]">Payment History</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#908fa0]" />
                <Input
                  type="text"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-[#0a0f1a] border-[#171f33] text-sm text-[#dae2fd] focus:border-[#4cd7f6]"
                />
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <CardContent className="p-16 text-center">
                <CreditCard className="h-12 w-12 text-[#464554] mx-auto" />
                <p className="text-[#dae2fd] mt-4 font-medium">
                  {searchQuery ? 'No payments found' : 'No payments recorded yet'}
                </p>
                <p className="text-sm text-[#908fa0] mt-1">
                  {searchQuery ? 'Try a different search' : 'Record your first payment to see it here'}
                </p>
              </CardContent>
            ) : (
              <div className="divide-y divide-[#171f33]">
                {filteredPayments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className="p-4 hover:bg-[#0a0f1a]/50 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center text-lg flex-shrink-0">
                        {getMethodIcon(payment.payment_method)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-mono text-sm font-bold text-[#dae2fd]">
                            {payment.payment_number}
                          </p>
                          <span className="text-xs text-[#464554]">•</span>
                          <p className="text-sm text-[#c7c4d7]">
                            {payment.invoice?.invoice_number || 'N/A'}
                          </p>
                        </div>
                        <p className="text-xs text-[#908fa0] mt-0.5">
                          {payment.invoice?.customer?.name || 'Walk-in'} • {formatDate(payment.payment_date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-emerald-400 text-base">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-[10px] text-[#908fa0] uppercase tracking-wider font-medium mt-0.5">
                        {payment.payment_method}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {showRecordDialog && (
        <RecordPaymentDialog
          open={showRecordDialog}
          onOpenChange={setShowRecordDialog}
          invoice={selectedInvoice}
          invoices={pendingInvoices}
          shopId={shopId}
        />
      )}
    </div>
  )
}
