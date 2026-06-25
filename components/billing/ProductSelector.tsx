"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  selling_price: number;
   gst_rate: number;
}

interface ProductSelectorProps {
  cartItems: any[];
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ProductSelector({
  cartItems,
  setCartItems,
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  function addToCart() {
    const product = products.find(
      (p) => p.id === Number(selectedProduct)
    );

    if (!product) return;

    const item = {
      id: product.id,
      name: product.name,
      price: product.selling_price,
      quantity,
      gst_rate: product.gst_rate,
      total: product.selling_price * quantity,
    };

    setCartItems([...cartItems, item]);

    setSelectedProduct("");
    setQuantity(1);
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">
        Product
      </h2>

      <div className="space-y-3">
        <select
          className="w-full rounded-md border p-2"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">
            Select Product
          </option>

          {products.map((product) => (
            <option
              key={product.id}
              value={product.id}
            >
              {product.name} - ₹{product.selling_price}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          step={1}
          value={quantity}
          onChange={(e) => {
            const value = Number(e.target.value);
            setQuantity(Math.max(1, value || 1));
          }}
          className="w-full rounded-md border p-2"
          />

        <button
          onClick={addToCart}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}