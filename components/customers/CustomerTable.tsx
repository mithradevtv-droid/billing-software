"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import CustomerEditDialog from "./CustomerEditDialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  gstin: string;
  address: string;
  state: string;
}

export default function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadCustomers(searchText = "") {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/customers${
          searchText
            ? `?search=${encodeURIComponent(searchText)}`
            : ""
        }`
      );

      const data = await res.json();

      setCustomers(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  async function deleteCustomer(id: number) {
    const ok = confirm(
      "Delete this customer?"
    );

    if (!ok) return;

    const res = await fetch(
      `/api/customers?id=${id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      loadCustomers(search);
    } else {
      alert("Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5">

      <div className="mb-5 flex justify-between">

        <h2 className="text-xl font-semibold">
          Customers
        </h2>

        <div className="relative w-72">

          <Search
            className="absolute left-3 top-3 h-4 w-4 text-gray-500"
          />

          <Input
            className="pl-9"
            placeholder="Search customer..."
            value={search}
            onChange={(e)=>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>Name</TableHead>

            <TableHead>Phone</TableHead>

            <TableHead>GSTIN</TableHead>

            <TableHead>State</TableHead>

            <TableHead className="text-right">
              Actions
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {customers.length === 0 && (

            <TableRow>

              <TableCell
                colSpan={5}
                className="text-center"
              >
                No customers found
              </TableCell>

            </TableRow>

          )}

          {customers.map((customer) => (

            <TableRow key={customer.id}>

              <TableCell className="font-medium">
                {customer.name}
              </TableCell>

              <TableCell>
                {customer.phone}
              </TableCell>

              <TableCell>
                {customer.gstin || "-"}
              </TableCell>

              <TableCell>
                {customer.state}
              </TableCell>

              <TableCell>

                <div className="flex justify-end gap-2">

                  <CustomerEditDialog
                     customer={customer}
                      onUpdated={() => loadCustomers(search)}
                  />

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      deleteCustomer(customer.id)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                </div>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </div>
  );
}