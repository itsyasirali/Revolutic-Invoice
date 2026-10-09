import { PortalQuotes } from "@/components/portal/PortalDocuments";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Quote", "Review this quote and accept or decline it.");


const Page = () => <PortalQuotes />;

export default Page;
