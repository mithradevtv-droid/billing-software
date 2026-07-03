import { getCurrentShop, getProducts } from '@/lib/db'
import { ProductsView } from '@/components/products/products-view'

export default async function ProductsPage() {
  const shop = await getCurrentShop()
  if (!shop) return null
  const products = await getProducts(shop.id)
  return <ProductsView initialProducts={products} shopId={shop.id} />
}
