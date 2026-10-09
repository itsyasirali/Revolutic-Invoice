import PortalProfile from "@/components/portal/PortalProfile";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Your Profile", "Update your contact details and password.");


const Page = () => <div className="px-2 sm:px-4 md:px-6 py-2"><PortalProfile /></div>;

export default Page;
