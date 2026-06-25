"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Props {
  product: Product;
  onUpdated: () => void;
}

export default function ProductEditDialog({
  product,
  onUpdated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(product);

  useEffect(() => {
    setForm(product);
  }, [product]);

  async function updateProduct() {
    const response = await fetch("/api/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      alert("Failed to update product");
      return;
    }

    setOpen(false);
    onUpdated();
  }
  if (
  form.purchase_price < 0 ||
  form.selling_price < 0 ||
  form.current_stock < 0 ||
  form.low_stock_threshold < 0
) {
  alert("Negative values are not allowed.");
  return;
}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">

          <Input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="col-span-2"
          />

          <Input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) =>
              setForm({
                ...form,
                sku: e.target.value,
              })
            }
          />

          <Input
            placeholder="HSN Code"
            value={form.hsn_code}
            onChange={(e) =>
              setForm({
                ...form,
                hsn_code: e.target.value,
              })
            }
          />

          <Select
            value={form.category}
            onValueChange={(value) =>
              setForm({
                ...form,
                category: value,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Billing Hardware">Billing Hardware</SelectItem>
              <SelectItem value="Printing">Printing</SelectItem>
              <SelectItem value="Consumables">Consumables</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Service">Service</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(form.gst_rate)}
            onValueChange={(value) =>
              setForm({
                ...form,
                gst_rate: Number(value),
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="0">0%</SelectItem>
              <SelectItem value="5">5%</SelectItem>
              <SelectItem value="12">12%</SelectItem>
              <SelectItem value="18">18%</SelectItem>
              <SelectItem value="28">28%</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Purchase Price"
            min={0}
            value={form.purchase_price}
            onChange={(e) =>
              setForm({
                ...form,
                purchase_price: Number(e.target.value),
              })
            }
          />

          <Input
            type="number"
            placeholder="Selling Price"
            min={0}
            value={form.selling_price}
            onChange={(e) =>
              setForm({
                ...form,
                selling_price: Number(e.target.value),
              })
            }
          />

          <Input
            type="number"
            placeholder="Stock"
            min={0}
            value={form.current_stock}
            onChange={(e) =>
              setForm({
                ...form,
                current_stock: Number(e.target.value),
              })
            }
          />

          <Input
            type="number"
            placeholder="Low Stock Alert"
            min={0}
            value={form.low_stock_threshold}
            onChange={(e) =>
              setForm({
                ...form,
                low_stock_threshold: Number(e.target.value),
              })
            }
          />

        </div>

        <DialogFooter>
          <Button
            className="w-full"
            onClick={updateProduct}
          >
            Update Product
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}