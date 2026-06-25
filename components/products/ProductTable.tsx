"use client";
import ProductEditDialog from "./ProductEditDialog";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: number;
  sku: string;
  name: string;
  hsn_code: string;
  category: string;
  purchase_price: number;
  selling_price: number;
  gst_rate: number;
  current_stock: number;
  low_stock_threshold: number;
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function deleteProduct(id: number) {
    const confirmed = confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/products?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setProducts((prev) =>
          prev.filter((product) => product.id !== id)
        );
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting product");
    }
  }

async function loadProducts() {
  setLoading(true);

  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  loadProducts();
}, []);


  if (loading) {
    return (
      <div className="rounded-xl border p-4">
        Loading products...
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <h2 className="mb-4 text-xl font-semibold">
        Products
      </h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>GST</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.sku}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.gst_rate}%</TableCell>
              <TableCell>{product.current_stock}</TableCell>
              <TableCell>
                ₹{product.selling_price.toLocaleString()}
              </TableCell>

              <TableCell>
                <div className="flex gap-2">
                  <ProductEditDialog
                    product={product}
                    onUpdated={loadProducts}
                    />

                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="rounded bg-red-500 px-2 py-1 text-white"
                  >
                    Delete
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}