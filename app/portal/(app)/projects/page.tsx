import { PortalProjects } from "@/components/portal/PortalProjects";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Your Projects", "Projects in progress with their tasks and logged time.");


const Page = () => <PortalProjects />;

export default Page;
