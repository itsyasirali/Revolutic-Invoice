import { Suspense } from "react";
import { PortalAccept } from "@/components/portal/PortalAuth";

const Page = () => (
  <Suspense fallback={null}>
    <PortalAccept />
  </Suspense>
);

export default Page;
