import { PortalProjectView } from "@/components/portal/PortalProjects";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Project", "Project progress, tasks and logged time.");


const Page = () => <PortalProjectView />;

export default Page;
