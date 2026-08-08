import { Suspense } from "react";
import CustomerList from "@/components/customer/CustomerList";

const CustomersPage = () => (
  <Suspense fallback={null}>
    <CustomerList />
  </Suspense>
);

export default CustomersPage;
