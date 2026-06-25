"use client";

import { useEffect, useState } from "react";

interface Customer {
  id: number;
  name: string;
  state: string;
  gstin: string;
}

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  setSelectedCustomer: (
    customer: Customer | null
  ) => void;
}

export default function CustomerSelector({
  selectedCustomer,
  setSelectedCustomer,
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  }, []);

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">
        Customer
      </h2>

      <select
        className="w-full rounded-md border p-2"
        value={selectedCustomer?.id || ""}
        onChange={(e) => {
          const customer = customers.find(
            (c) => c.id === Number(e.target.value)
          );

          setSelectedCustomer(
            customer || null
          );
        }}
      >
        <option value="">
          Select Customer
        </option>

        {customers.map((customer) => (
          <option
            key={customer.id}
            value={customer.id}
          >
            {customer.name}
          </option>
        ))}
      </select>
    </div>
  );
}