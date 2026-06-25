import AppLayout from "@/components/layout/AppLayout";
import CustomerTable from "@/components/customers/CustomerTable";
import AddCustomerDialog from "@/components/customers/AddCustomerDialog";

export default function CustomersPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Customers
            </h1>

            <p className="text-muted-foreground">
              Manage customer information
            </p>
          </div>

          <AddCustomerDialog />
        </div>

        <CustomerTable />
      </div>
    </AppLayout>
  );
}