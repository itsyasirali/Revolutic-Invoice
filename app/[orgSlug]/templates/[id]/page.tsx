import TemplateForm from "@/components/Templates/TemplateForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Template Preview", "Preview this template with sample data.");


export default function TemplateDetailsPage() {
  return <TemplateForm />;
}
