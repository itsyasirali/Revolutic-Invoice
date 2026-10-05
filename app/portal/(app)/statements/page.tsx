import PortalStatements from "@/components/portal/PortalStatements";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Account Statement", "Your invoices, payments and running balance.");


const Page = () => <PortalStatements />;

export default Page;
