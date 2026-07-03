import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Boxes, ShoppingCart, AlertTriangle } from 'lucide-react'

export function InventoryWatch({ products }: { products: any[] }) {
  return (
    <Card className="midnight-card border-[#464554]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center pulse-alert">
            <Boxes className="h-5 w-5 text-[#f59e0b]" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-[#dae2fd]" style={{ fontFamily: 'var(--font-sora)' }}>
              Inventory Watch
            </CardTitle>
            <p className="text-xs text-[#c7c4d7]">Low stock items</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#10b981]">
            <span className="inline-block pulse-alert">✓</span> All stock levels healthy
          </div>
        ) : (
          <div className="space-y-2 stagger">
            {products.map((p, idx) => (
              <div 
                key={p.id} 
                className="flex items-center justify-between p-3 bg-[#0b1326] rounded-lg border border-[#464554] row-hover group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#dae2fd] truncate group-hover:text-[#4cd7f6] transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs text-[#908fa0]">
                    {p.current_stock} {p.unit} left
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {p.current_stock === 0 ? (
                    <span className="status-pill status-unpaid">
                      <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                      Out
                    </span>
                  ) : (
                    <span className="status-pill status-partial">
                      Low
                    </span>
                  )}
                  <button className="p-1.5 rounded text-[#4cd7f6] hover:bg-[#4cd7f6]/10 scale-on-hover">
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <Link 
              href="/products"
              className="block text-center text-xs text-[#4cd7f6] hover:underline pt-3 hover:scale-105 transition-transform"
            >
              Manage inventory →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
