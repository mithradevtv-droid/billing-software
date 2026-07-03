import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Receipt } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/lib/gst-calculator'

export function RecentInvoices({ invoices }: { invoices: any[] }) {
  return (
    <Card className="midnight-card border-[#464554]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-[#464554]">
        <div>
          <CardTitle className="text-base font-bold text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
            Recent Invoices
          </CardTitle>
          <p className="text-xs text-[#c7c4d7] mt-0.5">Latest sales activity</p>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-[#4cd7f6] hover:bg-[#4cd7f6]/10">
          <Link href="/invoices">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {invoices.length === 0 ? (
          <div className="text-center py-12 text-[#c7c4d7] fade-in">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30 float" />
            <p>No invoices yet</p>
            <Link 
              href="/billing" 
              className="text-[#4cd7f6] text-sm hover:underline mt-2 inline-block hover:scale-105 transition-transform"
            >
              Create your first invoice →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6 stagger">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#464554]">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] py-3">
                    Invoice
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] py-3 hidden sm:table-cell">
                    Customer
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] py-3">
                    Status
                  </th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-[#908fa0] py-3">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    className="border-b border-[#464554] last:border-0 row-hover cursor-pointer group"
                  >
                    <td className="py-3">
                      <Link 
                        href={`/invoices/${inv.id}`} 
                        className="font-mono text-sm text-[#4cd7f6] group-hover:text-[#dae2fd] transition-colors"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="py-3 text-sm text-[#c7c4d7] hidden sm:table-cell">
                      {inv.customer?.name || 'Walk-in'}
                    </td>
                    <td className="py-3">
                      <span className={`status-pill ${getStatusClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-sm text-[#dae2fd] tabular-nums">
                      {formatCurrency(Number(inv.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getStatusClass(status: string) {
  switch (status) {
    case 'Paid': return 'status-paid'
    case 'Unpaid': return 'status-unpaid'
    case 'Partially Paid': return 'status-partial'
    default: return 'status-draft'
  }
}
