import PortalSettingsPage from "@/components/portal/PortalSettingsPage";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Customer Portal Settings", "Choose what customers can see and do in their portal, and review portal activity.");


const PortalSettingsRoute = () => <PortalSettingsPage />;

export default PortalSettingsRoute;
