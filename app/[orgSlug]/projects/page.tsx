import ProjectList from "@/components/Projects/ProjectList";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Projects", "Track projects with budgets, tasks, logged time, expenses and billing.");


const ProjectsPage = () => <ProjectList />;

export default ProjectsPage;
