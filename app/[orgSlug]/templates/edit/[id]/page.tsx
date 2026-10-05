import TemplateForm from "@/components/Templates/TemplateForm";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Edit Template", "Customize this template's branding, columns, colors and layout.");


export default function EditTemplatePage() {
  return <TemplateForm />;
}
