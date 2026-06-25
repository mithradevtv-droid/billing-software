"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  dialogFooter,
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

export default function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [stock, setStock] = useState("");
  const [lowStock, setLowStock] = useState("5");

  function generateSKU() {
    return `PRD-${Date.now()}`;
  }

    async function handleSave() {
    if (!name.trim()) {
      alert("Product name is required");
      return;
    }

    if (!category) {
      alert("Please select a category");
      return;
    }

    if (!hsnCode.trim()) {
      alert("HSN Code is required");
      return;
    }

    if (
       Number(purchasePrice) < 0 ||
       Number(sellingPrice) < 0 ||
       Number(stock) < 0 ||
       Number(lowStock) < 0
      ) {
        alert("Negative values are not allowed.");
        return;
    }  

    try {
      setLoading(true);

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku: sku.trim() || generateSKU(),
          name,
          hsn_code: hsnCode,
          category,
          purchase_price: Number(purchasePrice || 0),
          selling_price: Number(sellingPrice || 0),
          gst_rate: Number(gstRate),
          current_stock: Number(stock || 0),
          low_stock_threshold: Number(lowStock || 5),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to save product");
        return;
      }

      setSku("");
      setName("");
      setCategory("");
      setHsnCode("");
      setPurchasePrice("");
      setSellingPrice("");
      setGstRate("18");
      setStock("");
      setLowStock("5");

      setOpen(false);

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Product</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">

          <Input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-2"
          />

          <Input
            placeholder="SKU (Optional)"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />

          <Input
            placeholder="HSN Code"
            value={hsnCode}
            onChange={(e) => setHsnCode(e.target.value)}
          />

          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Billing Hardware">
                Billing Hardware
              </SelectItem>

              <SelectItem value="Printing">
                Printing
              </SelectItem>

              <SelectItem value="Consumables">
                Consumables
              </SelectItem>

              <SelectItem value="Electronics">
                Electronics
              </SelectItem>

              <SelectItem value="Accessories">
                Accessories
              </SelectItem>

              <SelectItem value="Software">
                Software
              </SelectItem>

              <SelectItem value="Service">
                Service
              </SelectItem>

              <SelectItem value="Other">
                Other
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={gstRate}
            onValueChange={setGstRate}
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
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Selling Price"
            min={0}
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Opening Stock"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Low Stock Alert"
            min={0}
            value={lowStock}
            onChange={(e) => setLowStock(e.target.value)}
          />

        </div>

        <dialogFooter className="mt-4"> 
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </dialogFooter>

      </DialogContent>
    </Dialog>
  );
}