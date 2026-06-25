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

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  gstin: string;
  address: string;
  state: string;
}

interface Props {
  customer: Customer;
  onUpdated: () => void;
}

export default function CustomerEditDialog({
  customer,
  onUpdated,
}: Props) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState(customer);

  useEffect(() => {
    setForm(customer);
  }, [customer]);

  async function updateCustomer() {
    const res = await fetch("/api/customers", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Failed to update customer");
      return;
    }

    setOpen(false);
    onUpdated();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <Input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <Input
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          <Input
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <Input
            value={form.gstin}
            onChange={(e) =>
              setForm({
                ...form,
                gstin: e.target.value,
              })
            }
          />

          <Input
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
          />

          <Select
            value={form.state}
            onValueChange={(value) =>
              setForm({
                ...form,
                state: value,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Kerala">Kerala</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Goa">Goa</SelectItem>
            </SelectContent>
          </Select>

        </div>

        <DialogFooter>
          <Button
            className="w-full"
            onClick={updateCustomer}
          >
            Update Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}