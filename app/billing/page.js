"use client";

import { useState } from "react";

import AppLayout from "@/components/layout/AppLayout";
import CustomerSelector from "@/components/billing/CustomerSelector";
import ProductSelector from "@/components/billing/ProductSelector";
import InvoiceCart from "@/components/billing/InvoiceCart";
import InvoiceSummary from "@/components/billing/InvoiceSummary";

export default function BillingPage() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] =
      useState(null);
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Create Invoice
          </h1>

          <p className="text-muted-foreground">
            Generate GST invoices
          </p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-xl border p-4">
            <CustomerSelector 
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
            />
          </div>

          <div className="rounded-xl border p-4">
            <ProductSelector
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          </div>

          <div className="rounded-xl border p-4">
            <InvoiceCart
              cartItems={cartItems}
            />
          </div>

          <div className="rounded-xl border p-4">
            <InvoiceSummary
              cartItems={cartItems}
              selectedCustomer={selectedCustomer}
              setCartItems={setCartItems}
              setSelectedCustomer={setSelectedCustomer}
              
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}