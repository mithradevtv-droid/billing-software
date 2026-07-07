'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

import { AddPurchaseDialog } from './add-purchase-dialog'
import { EditPurchaseDialog } from './edit-purchase-dialog'

export function PurchasesView({
  shopId,
  products,
  suppliers,
  purchases,
}: {
  shopId: string
  products: any[]
  suppliers: any[]
  purchases: any[]
}) {
  const [showAdd, setShowAdd] =
    useState(false)

  const [showEdit, setShowEdit] =
    useState(false)

  const [selectedPurchase, setSelectedPurchase] =
    useState<any>(null)

  async function handleDelete(
    purchaseId: string
  ) {
    const confirmed = window.confirm(
      'Delete this purchase?'
    )

    if (!confirmed) return

    try {
      const supabase = createClient()

      const { error: itemsError } =
        await supabase
          .from('purchase_items')
          .delete()
          .eq(
            'purchase_id',
            purchaseId
          )

      if (itemsError)
        throw itemsError

      const { error: orderError } =
        await supabase
          .from('purchase_orders')
          .delete()
          .eq('id', purchaseId)

      if (orderError)
        throw orderError

      toast.success(
        'Purchase deleted'
      )

      window.location.reload()
    } catch (err: any) {
      toast.error(
        err.message ||
          'Failed to delete purchase'
      )
    }
  }

return (
  <div className="p-6 space-y-6">

    <AddPurchaseDialog
      open={showAdd}
      onOpenChange={setShowAdd}
      shopId={shopId}
      products={products}
      suppliers={suppliers}
    />

    <EditPurchaseDialog
      open={showEdit}
      onOpenChange={setShowEdit}
      purchase={selectedPurchase}
      suppliers={suppliers}
      products={products}
    />

    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#dae2fd]">
          Purchases
        </h1>

        <p className="text-sm text-[#908fa0]">
          Manage supplier purchases
        </p>
      </div>

      <Button
        onClick={() => setShowAdd(true)}
        className="primary-gradient text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Purchase
      </Button>
    </div>

    {purchases.length === 0 ? (
      <div className="border border-dashed border-[#464554] rounded-xl p-12 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-[#4cd7f6]/50" />

        <h3 className="text-lg font-semibold text-[#dae2fd]">
          No Purchases Yet
        </h3>

        <p className="text-[#908fa0] mt-2">
          Create your first purchase order.
        </p>
      </div>
    ) : (
      <div className="space-y-3">
  {purchases.map((purchase) => (
    <div
      key={purchase.id}
      className="bg-[#171f33] border border-[#464554] rounded-xl p-4 hover:border-[#4cd7f6]/40 transition-colors"
    >
      <div className="flex items-center justify-between w-full">

        <div>
          <h3 className="font-semibold text-[#dae2fd]">
            {purchase.purchase_number}
          </h3>

          <p className="text-sm text-[#908fa0]">
            {
              suppliers.find(
                (s) => s.id === purchase.supplier_id
              )?.name || 'Unknown Supplier'
            }
          </p>

          <p className="text-xs text-[#908fa0] mt-1">
            {purchase.purchase_date}
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Button
            size="sm"
            variant="outline"
            className="border-[#464554]"
            onClick={() => {
              setSelectedPurchase(purchase)
              setShowEdit(true)
            }}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() =>
              handleDelete(purchase.id)
            }
          >
            Delete
          </Button>

          <div className="text-right">
            <p className="text-lg font-bold text-[#4cd7f6]">
              ₹{Number(purchase.total).toLocaleString('en-IN')}
            </p>

            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
              {purchase.status || 'Completed'}
            </span>
                        </div>

              </div>

            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)
}