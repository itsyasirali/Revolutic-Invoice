import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { getToken } from "next-auth/jwt";

const deleteTemplate = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const data = { user: token };
  const userId = data.user?.id;
  const { id } = await params;

  try {
    const parsedUserId = parseInt(String(userId));
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

    await templateRepo.remove(template);

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { message: "Failed to delete template" },
      { status: 500 }
    );
  }
};

export default deleteTemplate;
