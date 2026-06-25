"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  FileText,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardStats {
  todaySales: number;
  monthlyRevenue: number;
  totalInvoices: number;
  totalCustomers: number;
  totalProducts: number;
  lowStock: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    monthlyRevenue: 0,
    totalInvoices: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStock: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  const cards = [
    {
      title: "Today's Sales",
      value: `₹${Number(
        stats.todaySales
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      title: "Monthly Revenue",
      value: `₹${Number(
        stats.monthlyRevenue
      ).toLocaleString("en-IN")}`,
      icon: TrendingUp,
    },
    {
      title: "Invoices",
      value: stats.totalInvoices,
      icon: FileText,
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: Package,
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {card.title}
              </CardTitle>

              <Icon className="h-5 w-5 text-primary" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}