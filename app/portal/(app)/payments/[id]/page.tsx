import { PortalPayments } from "@/components/portal/PortalDocuments";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Payment", "View this payment receipt.");


const Page = () => <PortalPayments />;

export default Page;
