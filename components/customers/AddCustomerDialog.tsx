"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

export default function AddCustomerDialog() {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");

  async function saveCustomer() {
    if (!name.trim()) {
      alert("Customer name is required");
      return;
    }

    if (!state) {
      alert("Please select a state");
      return;
    }

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        email,
        gstin,
        address,
        state,
      }),
    });

    if (!res.ok) {
      alert("Failed to save customer");
      return;
    }

    // Clear form
    setName("");
    setPhone("");
    setEmail("");
    setGstin("");
    setAddress("");
    setState("");

    setOpen(false);

    // Temporary refresh for V1
    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Customer</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <Input
            placeholder="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder="GSTIN"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
          />

          <Input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Select
            value={state}
            onValueChange={setState}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="Kerala">
                Kerala
              </SelectItem>

              <SelectItem value="Tamil Nadu">
                Tamil Nadu
              </SelectItem>

              <SelectItem value="Karnataka">
                Karnataka
              </SelectItem>

              <SelectItem value="Maharashtra">
                Maharashtra
              </SelectItem>

              <SelectItem value="Goa">
                Goa
              </SelectItem>

            </SelectContent>
          </Select>

        </div>

        <DialogFooter>
          <Button
            className="w-full"
            onClick={saveCustomer}
          >
            Save Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}