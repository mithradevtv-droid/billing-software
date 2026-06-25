import AppLayout from "@/components/layout/AppLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import SalesOverview from "@/components/dashboard/SalesOverview";
import Quickactions from "@/components/dashboard/Quickactions";

export default function DashboardPage() {
  return (
  <AppLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

       <div>
        <h1 className="text-3xl font-bold">
            Dashboard
        </h1>

        <p className="text-muted-foreground">
            Welcome back to LedgerOne
        </p>
       </div>

        <Quickactions />

      </div>

        <StatsCards />

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="lg:col-span-2">
            <SalesOverview />
          </div>

          <div>
            <RecentInvoices />
          </div>

        </div>

      
  </AppLayout>
    );
}