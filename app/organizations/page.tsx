import OrganizationsList from "@/components/organization/OrganizationsList";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Your Organizations", "Switch between your organizations or create a new one.");


const OrganizationsPage = () => <OrganizationsList />;

export default OrganizationsPage;
