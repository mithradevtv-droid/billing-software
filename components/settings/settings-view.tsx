'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { deleteAccountAction } from '@/app/(dashboard)/settings/actions'
import {
  Building2, Phone, Mail, MapPin, Receipt, 
  Database, Save, Loader2, Download, 
  Shield, FileText, AlertTriangle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SettingsView({ shop }: { shop: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Form state
  const [name, setName] = useState(shop.name || '')
  const [phone, setPhone] = useState(shop.phone || '')
  const [email, setEmail] = useState(shop.email || '')
  const [address, setAddress] = useState(shop.address || '')
  const [gstin, setGstin] = useState(shop.gstin || '')
  const [state, setState] = useState(shop.state || '')

  const [invoicePrefix, setInvoicePrefix] = useState(shop.invoice_prefix || 'INV')
  const [nextNumber, setNextNumber] = useState(shop.next_invoice_number || 1)
  const [defaultTax, setDefaultTax] = useState(shop.default_tax_rate || 18)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('shops')
        .update({
          name, phone, email, address, gstin, state,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shop.id)

      if (error) throw error
      toast.success('Profile saved!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function saveInvoiceSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('shops')
        .update({
          invoice_prefix: invoicePrefix,
          next_invoice_number: nextNumber,
          default_tax_rate: defaultTax,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shop.id)

      if (error) throw error
      toast.success('Invoice settings saved!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }


  function downloadCSV(filename: string, rows: any[]) {
    if (rows.length === 0) {
      toast.info('No rows to export')
      return
    }

    const headers: string[] = Array.from(rows.reduce((set: Set<string>, row) => {
      Object.keys(row).forEach(key => set.add(key))
      return set
    }, new Set<string>()))

    const escapeCell = (value: any) => {
      if (value === null || value === undefined) return ''
      const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }

    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(header => escapeCell(row[header])).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function exportTable(table: 'invoices' | 'customers' | 'products') {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const today = new Date().toISOString().split('T')[0]
      downloadCSV(`${table}-${today}.csv`, data || [])
      toast.success(`${table} exported`)
    } catch (err: any) {
      toast.error(err.message || `Failed to export ${table}`)
    }
  }
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#dae2fd]">Settings</h1>
        <p className="text-sm text-[#c7c4d7]">Manage your shop profile and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Sidebar Navigation */}
      <TabsList
  className="
    grid
    w-full
    max-w-xl
    grid-cols-3
    bg-[#171f33]
    border
    border-[#464554]
    p-1
    rounded-xl
  "
>
  <TabsTrigger value="profile">
    Shop Profile
  </TabsTrigger>

  <TabsTrigger value="invoice">
    Invoice
  </TabsTrigger>

  <TabsTrigger value="data">
    Data & Export
  </TabsTrigger>
</TabsList>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Shop Profile Tab */}
          <TabsContent value="profile" className="mt-0">
            <Card className="midnight-card border-[#464554]">
              <CardHeader className="border-b border-[#464554]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#4cd7f6]" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-[#dae2fd]">
                      Business Information
                    </CardTitle>
                    <p className="text-xs text-[#c7c4d7]">
                      Your shop details used on invoices
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Shop Name *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input
                        id="gstin"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="29ABCDE1234F1Z5"
                        className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City, State, PIN"
                      className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
                    />
                  </div>

               <div className="space-y-2">
  <Label>State</Label>

  <Select
    value={state}
    onValueChange={setState}
  >
    <SelectTrigger className="bg-[#0b1326] border-[#464554] text-[#dae2fd]">
      <SelectValue placeholder="Select State" />
    </SelectTrigger>

    <SelectContent className="bg-[#171f33] border-[#464554] text-[#dae2fd] max-h-72">
      <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
      <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
      <SelectItem value="Assam">Assam</SelectItem>
      <SelectItem value="Bihar">Bihar</SelectItem>
      <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
      <SelectItem value="Goa">Goa</SelectItem>
      <SelectItem value="Gujarat">Gujarat</SelectItem>
      <SelectItem value="Haryana">Haryana</SelectItem>
      <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
      <SelectItem value="Jharkhand">Jharkhand</SelectItem>
      <SelectItem value="Karnataka">Karnataka</SelectItem>
      <SelectItem value="Kerala">Kerala</SelectItem>
      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
      <SelectItem value="Manipur">Manipur</SelectItem>
      <SelectItem value="Meghalaya">Meghalaya</SelectItem>
      <SelectItem value="Mizoram">Mizoram</SelectItem>
      <SelectItem value="Nagaland">Nagaland</SelectItem>
      <SelectItem value="Odisha">Odisha</SelectItem>
      <SelectItem value="Punjab">Punjab</SelectItem>
      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
      <SelectItem value="Sikkim">Sikkim</SelectItem>
      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
      <SelectItem value="Telangana">Telangana</SelectItem>
      <SelectItem value="Tripura">Tripura</SelectItem>
      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
      <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
      <SelectItem value="West Bengal">West Bengal</SelectItem>
    </SelectContent>
  </Select>
</div>


                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="primary-gradient text-white font-bold"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoice Settings Tab */}
          <TabsContent value="invoice" className="mt-0">
            <Card className="midnight-card border-[#464554]">
              <CardHeader className="border-b border-[#464554]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#8083ff]/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-[#8083ff]" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-[#dae2fd]">
                      Invoice Settings
                    </CardTitle>
                    <p className="text-xs text-[#c7c4d7]">
                      Configure invoice numbering and defaults
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={saveInvoiceSettings} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prefix">Invoice Prefix</Label>
                      <Input
                        id="prefix"
                        value={invoicePrefix}
                        onChange={(e) => setInvoicePrefix(e.target.value)}
                        className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="next">Next Invoice Number</Label>
                      <Input
                        id="next"
                        type="number"
                        min="1"
                        value={nextNumber}
                        onChange={(e) => setNextNumber(Number(e.target.value))}
                        className="bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6] font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax">Default Tax Rate</Label>
                      <select
                        id="tax"
                        value={defaultTax}
                        onChange={(e) => setDefaultTax(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-md bg-[#0b1326] border border-[#464554] text-[#dae2fd] focus:border-[#4cd7f6] outline-none"
                      >
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0b1326] rounded-lg border border-[#464554]">
                    <p className="text-xs text-[#908fa0] font-bold uppercase tracking-wider mb-2">
                      Preview Next Invoice Number
                    </p>
                    <p className="font-mono text-lg text-[#4cd7f6]">
                      {invoicePrefix}-{String(nextNumber).padStart(5, '0')}
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="primary-gradient text-white font-bold"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Invoice Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="midnight-card border-[#464554]">
                <CardHeader className="border-b border-[#464554]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                      <Download className="h-5 w-5 text-[#10b981]" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-[#dae2fd]">
                        Export Data
                      </CardTitle>
                      <p className="text-xs text-[#c7c4d7]">Download all your data</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[#464554] hover:bg-[#0b1326] hover:border-[#10b981] hover:text-[#10b981]"
                    onClick={() => exportTable('invoices')}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Export Invoices (CSV)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[#464554] hover:bg-[#0b1326] hover:border-[#10b981] hover:text-[#10b981]"
                    onClick={() => exportTable('customers')}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Export Customers (CSV)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[#464554] hover:bg-[#0b1326] hover:border-[#10b981] hover:text-[#10b981]"
                    onClick={() => exportTable('products')}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Export Products (CSV)
                  </Button>
                </CardContent>
              </Card>

              <Card className="midnight-card border-red-500/30">
                <CardHeader className="border-b border-[#464554]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-red-400">
                        Danger Zone
                      </CardTitle>
                      <p className="text-xs text-[#c7c4d7]">Irreversible actions</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
               <Button
  variant="outline"
  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
  onClick={async () => {
    const confirmed = confirm(
      '⚠️ This will permanently delete your shop, customers, products, invoices, purchases, payments and ALL data.\n\nThis action cannot be undone.\n\nContinue?'
    )

    if (!confirmed) return

    try {
      await deleteAccountAction(shop.id)

      toast.success(
        'Account deleted successfully'
      )

      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (err: any) {
      console.error(err)

      toast.error(
        err?.message ||
        'Failed to delete account'
      )
    }
  }}
>
  <AlertTriangle className="mr-2 h-4 w-4" />
  Delete Account & All Data
</Button>

                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
