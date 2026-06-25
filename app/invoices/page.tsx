"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          Invoices
        </h1>

        <div className="rounded-xl border p-4">
          <table className="w-full">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice: any) => (
                <tr key={invoice.id}>
                  <td>
                    {invoice.invoice_number}
                  </td>

                  <td>
                    {invoice.customer_name}
                  </td>

                  <td>
                    ₹{invoice.total}
                  </td>

                  <td>
                    {invoice.status}
                  </td>
                  <td>
                    <Link
                           href={`/invoices/${invoice.id}`}
                            className="rounded bg-white px-3 py-1 text-black hover:bg-blue-700 hover:text-white"
                          >
                        View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}