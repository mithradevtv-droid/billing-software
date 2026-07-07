'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, User, Phone, Mail, MapPin, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { AddCustomerDialog } from './add-customer-dialog'
import CustomerEditDialog from './CustomerEditDialog'

export function CustomersView({ 
  initialCustomers, 
  shopId 
}: { 
  initialCustomers: any[]
  shopId: string 
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [customers, setCustomers] = useState(initialCustomers)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  function handleAdded(newCustomer: any) {
    setCustomers([newCustomer, ...customers])
  }

  function handleUpdated(updatedCustomer?: any) {
    if (updatedCustomer) {
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c))
    }
    router.refresh()
  }

  async function deleteCustomer(customer: any) {
    if (!confirm(`Delete customer ${customer.name}?`)) return

    setDeletingId(customer.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id)
        .eq('shop_id', shopId)

      if (error) throw error

      setCustomers(prev => prev.filter(c => c.id !== customer.id))
      toast.success('Customer deleted')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#dae2fd]">
            Customers
          </h1>
          <p className="text-sm text-[#c7c4d7]">
            Manage your customer database ({customers.length} total)
          </p>
        </div>
        <Button 
          onClick={() => setShowAdd(true)}
          className="primary-gradient text-white font-bold uppercase tracking-wider text-xs"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card className="midnight-card border-[#464554]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0]" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="midnight-card border-[#464554]">
        <CardHeader className="border-b border-[#464554]">
          <CardTitle className="text-base font-bold text-[#dae2fd]">
            Customer Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#c7c4d7]">
              <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{search ? 'No customers found' : 'No customers yet'}</p>
              <Button 
                onClick={() => setShowAdd(true)}
                variant="link" 
                className="text-[#4cd7f6] mt-2"
              >
                Add your first customer
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#464554]">
              {filtered.map((customer) => (
                <div 
                  key={customer.id}
                  className="flex items-center justify-between p-4 hover:bg-[#222a3d] transition-colors group gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#8083ff] to-[#4cd7f6] flex items-center justify-center text-white font-bold shrink-0">
                      {customer.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#dae2fd] truncate">
                        {customer.name}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-[#908fa0] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </span>
                        {customer.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                        )}
                      </div>
                      {customer.state && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-[#c7c4d7]">
                          <MapPin className="h-3 w-3" />
                          {customer.state}
                          {customer.gstin && (
                            <span className="ml-2 font-mono text-[#4cd7f6]">
                              GSTIN: {customer.gstin}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {customer.gstin && (
                      <Badge variant="outline" className="border-[#4cd7f6] text-[#4cd7f6] text-[10px]">
                        B2B
                      </Badge>
                    )}
                    <CustomerEditDialog customer={customer} onUpdated={handleUpdated} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => deleteCustomer(customer)}
                      disabled={deletingId === customer.id}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      {deletingId === customer.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddCustomerDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        shopId={shopId}
        onAdded={handleAdded}
      />
    </div>
  )
}