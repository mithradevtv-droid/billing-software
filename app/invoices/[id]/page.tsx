"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoiceDetailPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/invoices?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => setInvoice(data));
  }, [params.id]);

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading Invoice...
      </div>
    );
  }

  const subtotal =
    invoice.subtotal ||
    invoice.items?.reduce(
      (sum: number, item: any) =>
        sum + Number(item.total),
      0
    );

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            Tax Invoice
          </h1>

          <button
            onClick={() => window.print()}
            className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
          >
            Print Invoice
          </button>
        </div>

        <div className="rounded-2xl bg-white p-10 shadow-lg">

          <div className="flex justify-between border-b pb-8">
            <div>
              <h2 className="text-4xl font-bold">
                LedgerOne
              </h2>

              <p className="mt-2 text-gray-500">
                GST Billing Software
              </p>

              <div className="mt-6 space-y-1">
                <p>
                  GSTIN:
                  {" "}
                  27AAAAA1111A1Z1
                </p>

                <p>
                  Maharashtra, India
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="mb-4">
                <p className="font-semibold">
                  Invoice Number
                </p>

                <p className="text-lg">
                  {invoice.invoice_number}
                </p>
              </div>

              <div className="mb-4">
                <p className="font-semibold">
                  Invoice Date
                </p>

                <p>{invoice.date}</p>
              </div>

              <div>
                <p className="font-semibold">
                  Status
                </p>

                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-xl font-semibold">
              Bill To
            </h3>

            <div className="space-y-1">
              <p className="text-lg font-medium">
                {invoice.customer_name ||
                  "Walk-in Customer"}
              </p>

              <p>
                GSTIN:
                {" "}
                {invoice.gstin || "-"}
              </p>

              <p>
                State:
                {" "}
                {invoice.state || "-"}
              </p>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left">
                    Product
                  </th>

                  <th className="p-4 text-center">
                    Qty
                  </th>

                  <th className="p-4 text-right">
                    Rate
                  </th>

                  <th className="p-4 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoice.items?.map(
                  (item: any) => (
                    <tr
                      key={item.id}
                      className="border-t"
                    >
                      <td className="p-4">
                        {item.product_name}
                      </td>

                      <td className="p-4 text-center">
                        {item.quantity}
                      </td>

                      <td className="p-4 text-right">
                        ₹
                        {Number(
                          item.unit_price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="p-4 text-right font-medium">
                        ₹
                        {Number(
                          item.total
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-10 ml-auto max-w-sm space-y-3">

            <div className="flex justify-between">
              <span>Subtotal</span>

              <span>
                ₹
                {Number(
                  subtotal
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between">
              <span>CGST</span>

              <span>
                ₹
                {Number(
                  invoice.cgst || 0
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between">
              <span>SGST</span>

              <span>
                ₹
                {Number(
                  invoice.sgst || 0
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between">
              <span>IGST</span>

              <span>
                ₹
                {Number(
                  invoice.igst || 0
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between border-t pt-4 text-2xl font-bold">
              <span>
                Grand Total
              </span>

              <span>
                ₹
                {Number(
                  invoice.total
                ).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}