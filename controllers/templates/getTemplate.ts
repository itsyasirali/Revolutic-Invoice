import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { getAuthUserId } from "@/lib/session";

const getTemplate = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const parsedUserId = userId;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const templateRepo = db.getRepository(Template);

    const template = await templateRepo.findOne({
      where: { id: templateId, userId: parsedUserId },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { message: "Failed to fetch template" },
      { status: 500 }
    );
  }
};

export default getTemplate;
