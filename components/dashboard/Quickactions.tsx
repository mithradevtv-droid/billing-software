"use client";

import Link from "next/link";
import { Plus, Package, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3 justify-end">

      <Link href="/billing">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </Link>

      <Link href="/products">
        <Button variant="outline" className="gap-2">
          <Package className="h-4 w-4" />
          Add Product
        </Button>
      </Link>

      <Link href="/customers">
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Add Customer
        </Button>
      </Link>

    </div>
  );
}