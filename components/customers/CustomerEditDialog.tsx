"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

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
  id: string | number;
  name: string;
  phone: string;
  email: string | null;
  gstin: string | null;
  address: string | null;
  state: string | null;
}

interface Props {
  customer: Customer;
  onUpdated: (customer?: Customer) => void;
}

export default function CustomerEditDialog({ customer, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Customer>(customer);

  useEffect(() => {
    setForm(customer);
  }, [customer]);

  async function updateCustomer() {
    if (!form.name?.trim() || !form.phone?.trim()) {
      toast.error("Customer name and phone are required");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("customers")
        .update({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email || null,
          gstin: form.gstin || null,
          address: form.address || null,
          state: form.state || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Customer updated");
      setOpen(false);
      onUpdated(data as Customer);
    } catch (err: any) {
      toast.error(err.message || "Failed to update customer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg bg-[#171f33] border-[#464554] text-[#dae2fd]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Customer name"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-[#0b1326] border-[#464554]"
          />

          <Input
            placeholder="Phone"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="bg-[#0b1326] border-[#464554]"
          />

          <Input
            placeholder="Email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-[#0b1326] border-[#464554]"
          />

          <Input
            placeholder="GSTIN"
            value={form.gstin || ""}
            onChange={(e) => setForm({ ...form, gstin: e.target.value })}
            className="bg-[#0b1326] border-[#464554]"
          />

          <Input
            placeholder="Address"
            value={form.address || ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="bg-[#0b1326] border-[#464554]"
          />

          <Select
            value={form.state || undefined}
            onValueChange={(value) => setForm({ ...form, state: value })}
          >
            <SelectTrigger className="w-full bg-[#0b1326] border-[#464554]">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>

            <SelectContent className="bg-[#171f33] border-[#464554]">
              <SelectItem value="Kerala">Kerala</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Goa">Goa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button className="w-full primary-gradient" onClick={updateCustomer} disabled={saving}>
            {saving ? "Updating..." : "Update Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}