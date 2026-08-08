import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { readSession } from "@/lib/session";

const setDefaultTemplate = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { data } = await readSession(req);
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

    await templateRepo.update({ userId: parsedUserId }, { isDefault: false });
    await templateRepo.update(
      { id: templateId, userId: parsedUserId },
      { isDefault: true }
    );

    return NextResponse.json({
      message: "Template set as default successfully",
    });
  } catch (error) {
    console.error("Error setting default template:", error);
    return NextResponse.json(
      { message: "Failed to set default template" },
      { status: 500 }
    );
  }
};

export default setDefaultTemplate;
