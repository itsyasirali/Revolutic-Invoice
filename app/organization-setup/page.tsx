import { Suspense } from "react";
import OrganizationSetup from "@/components/organization/OrganizationSetup";

const OrganizationSetupPage = () => (
  <Suspense fallback={null}>
    <OrganizationSetup />
  </Suspense>
);

export default OrganizationSetupPage;
