import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const setDefaultTemplate = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const organizationId = await getAuthOrgId(req);
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const templateRepo = db.getRepository(Template);
    const scopeWhere = organizationId ? { organizationId } : { userId };

    await templateRepo.update(scopeWhere, { isDefault: false });
    await templateRepo.update(
      { id: templateId, ...scopeWhere },
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
