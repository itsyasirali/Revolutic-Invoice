import PortalDashboard from "@/components/portal/PortalDashboard";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Portal Dashboard", "Your outstanding balance, recent invoices, quotes and payments.");


const Page = () => <PortalDashboard />;

export default Page;
