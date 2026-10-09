import { PortalInvoices } from "@/components/portal/PortalDocuments";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Invoice", "View this invoice, download it as a PDF and leave a comment.");


const Page = () => <PortalInvoices />;

export default Page;
