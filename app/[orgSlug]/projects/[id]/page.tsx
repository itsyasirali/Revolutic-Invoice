import ProjectSplitView from "@/components/Projects/ProjectSplitView";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Project Details", "Project overview with tasks, time, expenses and invoices, plus budget and billing status.");


const DetailsPage = () => <ProjectSplitView />;

export default DetailsPage;
