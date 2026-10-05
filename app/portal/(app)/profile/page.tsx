import PortalProfile from "@/components/portal/PortalProfile";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Your Profile", "Update your contact details and password.");


const Page = () => <PortalProfile />;

export default Page;
