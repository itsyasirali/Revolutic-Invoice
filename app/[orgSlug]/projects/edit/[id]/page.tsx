import ProjectForm from "@/components/Projects/ProjectForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Edit Project", "Update this project's customer, billing method, budget and dates.");


const EditProjectPage = () => <ProjectForm />;

export default EditProjectPage;
