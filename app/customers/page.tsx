import { Suspense } from "react";
import CustomerList from "@/components/customer/CustomerList";
import TableSkeleton from "@/components/ui/TableSkeleton";

const CustomersPage = () => (
  <Suspense fallback={<TableSkeleton title="Customers" columns={5} rows={6} />}>
    <CustomerList />
  </Suspense>
);

export default CustomersPage;
