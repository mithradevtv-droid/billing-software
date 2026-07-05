'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddSupplierDialog } from './add-supplier-dialog'
import { EditSupplierDialog } from './edit-supplier-dialog'
import { Plus, Search, Building2, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function SuppliersView({
  suppliers: initialSuppliers,
  shopId,
}: {
  suppliers: any[]
  shopId: string
}) {
  const [suppliers, setSuppliers] =
    useState(initialSuppliers)

  const [showAdd, setShowAdd] =
    useState(false)

  const [showEdit, setShowEdit] =
    useState(false)

  const [selectedSupplier, setSelectedSupplier] =
    useState<any>(null)

  const [search, setSearch] =
    useState('')

  function handleAdded(supplier: any) {
    setSuppliers((prev) => [
      supplier,
      ...prev,
    ])
  }

  function handleUpdated(updated: any) {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === updated.id
          ? updated
          : supplier
      )
    )
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this supplier?'))
      return

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuppliers((prev) =>
        prev.filter((s) => s.id !== id)
      )

      toast.success('Supplier deleted')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const filteredSuppliers =
    suppliers.filter((supplier) =>
      supplier.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#dae2fd]">
            Suppliers
          </h1>

          <p className="text-sm text-[#908fa0]">
            Manage your supplier database
          </p>
        </div>

        <Button
          onClick={() => setShowAdd(true)}
          className="primary-gradient text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-[#908fa0]" />

        <Input
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="pl-10 bg-[#0b1326] border-[#464554]"
        />
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="border border-dashed border-[#464554] rounded-xl p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-[#4cd7f6]/50" />

          <h3 className="text-lg font-semibold text-[#dae2fd]">
            No Suppliers Found
          </h3>

          <p className="text-[#908fa0] mt-2">
            Add your first supplier to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-[#171f33] border border-[#464554] rounded-xl p-4 hover:border-[#4cd7f6]/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#4cd7f6]" />
                </div>

                <div>
                  <h3 className="font-semibold text-[#dae2fd]">
                    {supplier.name}
                  </h3>

                  <p className="text-xs text-[#908fa0]">
                    Supplier
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#c7c4d7]">
                  <Phone className="h-3.5 w-3.5" />
                  {supplier.phone}
                </div>

                {supplier.email && (
                  <p className="text-[#908fa0]">
                    {supplier.email}
                  </p>
                )}

                {supplier.gstin && (
                  <p className="text-[#4cd7f6] text-xs font-mono">
                    GSTIN: {supplier.gstin}
                  </p>
                )}

                {supplier.state && (
                  <p className="text-[#908fa0] text-xs">
                    {supplier.state}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSupplier(supplier)
                    setShowEdit(true)
                  }}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    handleDelete(supplier.id)
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddSupplierDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        shopId={shopId}
        onAdded={handleAdded}
      />

      <EditSupplierDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        supplier={selectedSupplier}
        onUpdated={handleUpdated}
      />
    </div>
  )
}