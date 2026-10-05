import TemplateForm from "@/components/Templates/TemplateForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("New Template", "Create a document template with your branding, columns and layout.");


export default function NewTemplatePage() {
  return <TemplateForm />;
}
