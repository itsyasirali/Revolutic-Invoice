import { Suspense } from "react";
import { PortalLogin } from "@/components/portal/PortalAuth";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Customer Portal Sign In", "Sign in to view your quotes, invoices, payments and projects.");


const Page = () => (
  <Suspense fallback={null}>
    <PortalLogin />
  </Suspense>
);

export default Page;
