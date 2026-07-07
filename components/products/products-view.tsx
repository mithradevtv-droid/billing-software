'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, Search, Package, AlertTriangle, 
  Edit, Boxes, Tag
} from 'lucide-react'
import { toast } from 'sonner'
import { AddProductDialog } from './add-product-dialog'
import { EditProductDialog } from './edit-product-dialog'
import { StockAdjustDialog } from './stock-adjust-dialog'

export function ProductsView({ 
  initialProducts, 
  shopId 
}: { 
  initialProducts: any[]
  shopId: string 
}) {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [products, setProducts] = useState(initialProducts)
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [showStock, setShowStock] = useState(false)

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.hsn_code?.includes(search)
  )

  const lowStock = products.filter(p => p.current_stock <= p.low_stock_threshold)
  const totalValue = products.reduce((sum, p) => sum + (Number(p.selling_price) * Number(p.current_stock)), 0)

  function handleAdded(newProduct: any) {
    setProducts([newProduct, ...products])
  }

  function getStockStatus(stock: number, threshold: number) {
    if (stock === 0) return { label: 'Out of Stock', class: 'status-unpaid', variant: 'destructive' as const }
    if (stock <= threshold) return { label: 'Low Stock', class: 'status-partial', variant: 'outline' as const }
    return { label: 'In Stock', class: 'status-paid', variant: 'default' as const }
  }
  function handleUpdated(updated: any) {
  setProducts(prev =>
    prev.map(p =>
      p.id === updated.id ? updated : p
    )
  )
}

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#dae2fd]">
            Inventory
          </h1>
          <p className="text-sm text-[#c7c4d7]">
            {products.length} products • Total value: ₹{totalValue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(view === 'grid' ? 'table' : 'grid')}
            className="border-[#464554] text-[#c7c4d7] hover:border-[#4cd7f6]"
          >
            {view === 'grid' ? 'Table View' : 'Grid View'}
          </Button>
          <Button 
            onClick={() => setShowAdd(true)}
            className="primary-gradient text-white font-bold uppercase tracking-wider text-xs"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="midnight-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#4cd7f6]/10 flex items-center justify-center">
              <Boxes className="h-5 w-5 text-[#4cd7f6]" />
            </div>
            <div>
              <p className="text-xs text-[#908fa0] font-bold uppercase tracking-wider">Total Products</p>
              <p className="text-xl font-bold text-[#dae2fd]">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="midnight-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-[#10b981]" />
            </div>
            <div>
              <p className="text-xs text-[#908fa0] font-bold uppercase tracking-wider">Stock Value</p>
              <p className="text-xl font-bold text-[#dae2fd]">
                ₹{(totalValue / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>
        <div className="midnight-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-xs text-[#908fa0] font-bold uppercase tracking-wider">Low Stock</p>
              <p className="text-xl font-bold text-[#f59e0b]">{lowStock.length}</p>
            </div>
          </div>
        </div>
        <div className="midnight-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#8083ff]/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-[#8083ff]" />
            </div>
            <div>
              <p className="text-xs text-[#908fa0] font-bold uppercase tracking-wider">Categories</p>
              <p className="text-xl font-bold text-[#dae2fd]">
                {new Set(products.map(p => p.category).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="midnight-card border-[#464554]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#908fa0]" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-[#0b1326] border-[#464554] focus:border-[#4cd7f6]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Display */}
      {filtered.length === 0 ? (
        <Card className="midnight-card border-[#464554]">
          <CardContent className="p-16 text-center">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30 text-[#908fa0]" />
            <p className="text-[#c7c4d7]">
              {search ? 'No products match your search' : 'No products yet'}
            </p>
            <Button 
              onClick={() => setShowAdd(true)}
              className="primary-gradient mt-4 text-white font-bold"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const status = getStockStatus(Number(product.current_stock), Number(product.low_stock_threshold))
            return (
              <div 
                key={product.id}
                className="midnight-card border-[#464554] rounded-xl overflow-hidden hover:border-[#4cd7f6] hover:-translate-y-1 transition-all group"
              >
                {/* Image Area */}
                <div className="aspect-square bg-gradient-to-br from-[#4cd7f6]/10 to-[#8083ff]/10 flex items-center justify-center relative overflow-hidden">
  
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                   />
                  ) : (
                <Package className="h-16 w-16 text-[#4cd7f6]/40 group-hover:scale-110 transition-transform" />
                  )}

                <Badge
                  variant={status.variant}
                  className="absolute top-2 right-2 text-[10px] font-bold"
                >
                  {status.label === 'In Stock'
                    ? 'OK'
                    : status.label === 'Low Stock'
                    ? '!'
                    : 'X'}{' '}
                  {status.label}
                </Badge>

                </div>
                {/* Info */}
                <div className="p-3 space-y-1">
                  <p className="font-semibold text-sm text-[#dae2fd] line-clamp-2 leading-tight min-h-[2.5rem]">
                    {product.name}
                  </p>
                  <p className="text-xs text-[#908fa0] font-mono"> SKU:{product.sku}</p>
                  {product.category && (
                    <p className="text-xs text-[#c7c4d7]">{product.category}</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-[#464554]">
                    <div className="flex gap-2 mt-3 pt-3 border-t border-[#464554]">
                        <Button
                           size="sm"
                           variant="outline"
                           className="flex-1"
                           onClick={() => {
                               setSelectedProduct(product)
                               setShowEdit(true)
                             }}
                         >
                           <Edit className="h-3 w-3 mr-1" />
                              Edit
                        </Button>
                        <Button
                         size="sm"
                          variant="outline"
                          className="flex-1"
                           onClick={() => {
                              setSelectedProduct(product)
                              setShowStock(true)
                             }}
                        >
                           Stock
                        </Button>
                    </div>
                    <div>
                      <p className="text-xs text-[#908fa0]">Price</p>
                      <p className="font-bold text-[#4cd7f6]">
                        ₹{Number(product.selling_price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#908fa0]">Stock</p>
                      <p className={`font-bold ${
                        product.current_stock === 0 ? 'text-[#ef4444]' :
                        product.current_stock <= product.low_stock_threshold ? 'text-[#f59e0b]' : 'text-[#10b981]'
                      }`}>
                        {product.current_stock} {product.unit || 'pcs'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="midnight-card border-[#464554] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#464554]">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4">Product</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4 hidden md:table-cell">SKU</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4 hidden lg:table-cell">Category</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4">Price</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4">Stock</th>
                  <th className="text-center text-[10px] font-bold uppercase tracking-widest text-[#908fa0] p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const status = getStockStatus(Number(product.current_stock), Number(product.low_stock_threshold))
                  return (
                    <tr key={product.id} className="border-b border-[#464554] last:border-0 hover:bg-[#222a3d] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-[#dae2fd]">{product.name}</p>
                        <p className="text-xs text-[#908fa0] md:hidden"> SKU: {product.sku}</p>
                      </td>
                      <td className="p-4 text-sm text-[#c7c4d7] font-mono hidden md:table-cell"> SKU: {product.sku}</td>
                      <td className="p-4 text-sm text-[#c7c4d7] hidden lg:table-cell">{product.category || '-'}</td>
                      <td className="p-4 text-right font-mono text-[#4cd7f6]">
                        ₹{Number(product.selling_price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right font-bold">
                        <span className={
                          product.current_stock === 0 ? 'text-[#ef4444]' :
                          product.current_stock <= product.low_stock_threshold ? 'text-[#f59e0b]' : 'text-[#10b981]'
                        }>
                          {product.current_stock}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={status.variant} className="text-[10px]">
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AddProductDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        shopId={shopId}
        onAdded={handleAdded}
      />
      <EditProductDialog
       open={showEdit}
       onOpenChange={setShowEdit}
       product={selectedProduct}
       onUpdated={handleUpdated}
      />
      <StockAdjustDialog
        open={showStock}
        onOpenChange={setShowStock}
        product={selectedProduct}
         shopId={shopId}
         onUpdated={handleUpdated}
      />
    </div>
  )
}


