import AppLayout from "@/components/layout/AppLayout";
import ProductTable from "@/components/products/ProductTable";
import AddProductDialog from "@/components/products/AddProductDialog";

export default function ProductsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Products
            </h1>

            <p className="text-muted-foreground">
              Manage your inventory and pricing
            </p>
          </div>

          <AddProductDialog />

        </div>

        <ProductTable />

      </div>
    </AppLayout>
  );
}