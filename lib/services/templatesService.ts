import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import type { TemplateListItem } from "@/types/template";

const fetchTemplatesForUser = async (
  userId: number,
): Promise<TemplateListItem[]> => {
  try {
    const db = await getDatabase();
    const templateRepo = db.getRepository(Template);

    const templates = await templateRepo.find({
      where: { userId },
      order: { isDefault: "DESC", createdAt: "DESC" },
    });

    const listItems: TemplateListItem[] = templates.map((template) => ({
      id: (template.id ?? "").toString(),
      name: template.templateName || "Untitled Template",
      paperSize: template.paperSize || "A4",
      orientation: template.orientation || "portrait",
      isDefault: Boolean(template.isDefault),
      createdAt: template.createdAt
        ? new Date(template.createdAt).toLocaleDateString()
        : "",
      raw: JSON.parse(JSON.stringify(template)),
    }));

    return listItems;
  } catch (error) {
    console.error("Error fetching templates on server:", error);
    return [];
  }
};


export default fetchTemplatesForUser;
