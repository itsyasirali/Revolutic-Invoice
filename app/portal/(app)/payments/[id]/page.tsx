import { PortalPaymentView } from "@/components/portal/PortalDocuments";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Payment", "View this payment receipt.");


const Page = () => <PortalPaymentView />;

export default Page;
