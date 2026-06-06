import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  Boxes,
  Calculator,
  ChartNoAxesCombined,
  FileText,
  LayoutDashboard,
  ReceiptIndianRupee,
  Settings,
  ShoppingCart,
  Users,
  WalletCards,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, active: true },
  { label: "Billing", href: "/billing", icon: ReceiptIndianRupee },
  { label: "Reports", href: "/billing#reports", icon: BarChart3 },
  { label: "Inventory", href: "/billing#inventory", icon: Boxes },
  { label: "Customers", href: "/billing#customers", icon: Users },
  { label: "Settings", href: "/billing#settings", icon: Settings },
];

const metrics = [
  {
    label: "Today sales",
    value: "INR 82,450",
    note: "38 bills",
    icon: BadgeIndianRupee,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    label: "Receivables",
    value: "INR 18,920",
    note: "7 open",
    icon: WalletCards,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    label: "GST output",
    value: "INR 12,864",
    note: "June",
    icon: Calculator,
    color: "text-green-700",
    bg: "bg-green-50",
  },
  {
    label: "Low stock",
    value: "5 SKUs",
    note: "Needs order",
    icon: Boxes,
    color: "text-red-700",
    bg: "bg-red-50",
  },
];

const invoices = [
  ["INV-2026-1042", "Urban Retail Co.", "Paid", "INR 24,800"],
  ["INV-2026-1041", "Walk-in Customer", "Paid", "INR 3,420"],
  ["INV-2026-1040", "Mira Devices", "Unpaid", "INR 11,620"],
  ["INV-2026-1039", "R K Traders", "Paid", "INR 18,300"],
];

const stock = [
  ["Thermal printer roll", "4 left", "Reorder"],
  ["USB barcode scanner", "3 left", "Reorder"],
  ["POS cash drawer", "2 left", "Hold"],
  ["A4 invoice paper", "11 left", "Watch"],
];

const gstBreakup = [
  ["B2B taxable", "INR 46,000"],
  ["B2C taxable", "INR 25,420"],
  ["CGST", "INR 4,186"],
  ["SGST", "INR 4,186"],
  ["IGST", "INR 4,492"],
];

const trend = [46, 62, 58, 74, 68, 82, 77, 91, 86, 96, 89, 104];

export default function Home() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar no-print">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950">
            <ReceiptIndianRupee size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-black">LedgerOne</p>
            <p className="text-xs text-slate-400">GST Billing</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  item.active
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-bold text-white">probes</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            GSTIN 27AAAAA1111A1Z1
          </p>
          <p className="text-xs leading-5 text-slate-400">Kerala</p>
        </div>
      </aside>

      <main className="app-main">
        <header className="site-header mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold text-blue-700">June 2026</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">
              Billing Dashboard
            </h1>
          </div>
          <div className="site-actions flex flex-wrap gap-2">
            <Link href="/billing#reports" className="btn-secondary">
              <BarChart3 size={18} aria-hidden="true" />
              GSTR1
            </Link>
            <Link href="/billing" className="btn-primary">
              <ShoppingCart size={18} aria-hidden="true" />
              New invoice
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article key={metric.label} className="panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-2xl font-black text-slate-950">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{metric.note}</p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${metric.bg} ${metric.color}`}
                  >
                    <Icon size={21} aria-hidden="true" />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
          <div className="space-y-6">
            <section className="panel p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Sales Movement
                  </h2>
                  <p className="text-sm text-slate-500">
                    Daily billed value by counter
                  </p>
                </div>
                <span className="status-pill status-draft">Live counter</span>
              </div>
              <div className="mt-6 flex h-56 items-end gap-3 border-b border-slate-200 px-1">
                {trend.map((height, index) => (
                  <div
                    key={height + index}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div
                      className="w-full rounded-t-md bg-blue-600"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs font-semibold text-slate-400">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 p-5">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Recent Invoices
                  </h2>
                  <p className="text-sm text-slate-500">
                    Latest sales bills and settlement state
                  </p>
                </div>
                <Link href="/billing" className="icon-button" title="Open billing">
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(([number, customer, status, amount]) => (
                      <tr key={number}>
                        <td className="font-bold">{number}</td>
                        <td>{customer}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              status === "Paid" ? "status-paid" : "status-unpaid"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="text-right font-bold">{amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="panel p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
                  <ChartNoAxesCombined size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    GST Summary
                  </h2>
                  <p className="text-sm text-slate-500">Current filing month</p>
                </div>
              </div>
              <dl className="mt-5 space-y-3">
                {gstBreakup.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-slate-100 pb-3"
                  >
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="text-sm font-black text-slate-950">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="panel p-5" id="inventory">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <Boxes size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Inventory Watch
                  </h2>
                  <p className="text-sm text-slate-500">Stock exceptions</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {stock.map(([name, count, state]) => (
                  <div
                    key={name}
                    className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 pb-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-950">{name}</p>
                      <p className="text-xs text-slate-500">{count}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700">
                      {state}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <Link
              href="/billing"
              className="flex min-h-24 items-center justify-between rounded-lg border border-slate-900 bg-slate-950 p-5 text-white transition hover:bg-slate-800"
            >
              <div>
                <p className="text-base font-black">Billing Counter</p>
                <p className="mt-1 text-sm text-slate-300">
                  Invoice, tax, stock, and print
                </p>
              </div>
              <FileText size={24} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
