import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const getAllTemplates = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const organizationId = await getAuthOrgId(req);
    const db = await getDatabase();
    const templateRepo = db.getRepository(Template);

    const where = organizationId
      ? { organizationId }
      : { userId };

    const templates = await templateRepo.find({
      where,
      order: { isDefault: "DESC", createdAt: "DESC" },
    });

    return NextResponse.json(templates);
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { message: "Failed to fetch templates", error: error?.message || String(error) },
      { status: 500 }
    );
  }
};

export default getAllTemplates;
