import { Suspense } from "react";
import { PortalLogin } from "@/components/portal/PortalAuth";

const Page = () => (
  <Suspense fallback={null}>
    <PortalLogin />
  </Suspense>
);

export default Page;
