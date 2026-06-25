"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  FileBarChart,
  Settings,
  ReceiptText,
} from "lucide-react";

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Billing", href: "/billing", icon: ReceiptText },

];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background h-screen p-4">
      <h1 className="text-2xl font-bold mb-8">
        LedgerOne
      </h1>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted"
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}