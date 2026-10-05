import { Suspense } from "react";
import OrganizationSetup from "@/components/organization/OrganizationSetup";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Set Up Your Organization", "Tell us about your business to set up your organization, currency and address.");


const OrganizationSetupPage = () => (
  <Suspense fallback={null}>
    <OrganizationSetup />
  </Suspense>
);

export default OrganizationSetupPage;
