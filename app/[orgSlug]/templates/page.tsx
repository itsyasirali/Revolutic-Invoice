import TemplateList from "@/components/Templates/TemplateList";
import fetchTemplatesForUser from "@/lib/services/templatesService";
import { getServerSessionUser } from "@/lib/session";
import { privateMeta } from "@/lib/pageMeta";

export const metadata = privateMeta("Invoice Templates", "Design the look of your invoices, quotes and receipts, and choose a default template.");


const TemplatesPage = async () => {
  const user = await getServerSessionUser();
  const orgId = user?.organizationId ? Number(user.organizationId) : null;
  const templates = user?.id ? await fetchTemplatesForUser(Number(user.id), orgId) : [];

  return <TemplateList initialTemplates={templates} />;
};

export default TemplatesPage;
