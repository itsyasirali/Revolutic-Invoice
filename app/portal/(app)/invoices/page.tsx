import { PortalInvoices } from "@/components/portal/PortalDocuments";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Your Invoices", "All invoices sent to you, with their status and balance due.");


const Page = () => <PortalInvoices />;

export default Page;
