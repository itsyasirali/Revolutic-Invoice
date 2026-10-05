import { Suspense } from "react";
import { PortalAccept } from "@/components/portal/PortalAuth";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Accept Your Invitation", "Set a password to activate your customer portal access.");


const Page = () => (
  <Suspense fallback={null}>
    <PortalAccept />
  </Suspense>
);

export default Page;
