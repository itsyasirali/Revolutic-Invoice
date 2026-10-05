import ProjectForm from "@/components/Projects/ProjectForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("New Project", "Create a project for a customer with billing method, budget and dates.");


const NewProjectPage = () => <ProjectForm />;

export default NewProjectPage;
