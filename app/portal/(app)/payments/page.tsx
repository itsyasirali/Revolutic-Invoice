import { PortalPayments } from "@/components/portal/PortalDocuments";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Your Payments", "Payments you have made, and the invoices they were applied to.");


const Page = () => <PortalPayments />;

export default Page;
