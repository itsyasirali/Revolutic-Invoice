import { PortalQuotes } from "@/components/portal/PortalDocuments";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Your Quotes", "Quotes sent to you, ready to accept or decline.");


const Page = () => <PortalQuotes />;

export default Page;
