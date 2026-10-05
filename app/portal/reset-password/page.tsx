import { Suspense } from "react";
import { PortalResetPassword } from "@/components/portal/PortalAuth";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Reset Password", "Choose a new password for your customer portal account.");

const Page = () => (
  <Suspense fallback={null}>
    <PortalResetPassword />
  </Suspense>
);

export default Page;
