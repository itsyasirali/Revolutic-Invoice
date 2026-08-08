import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Template } from "@/entities/Template";
import { readSession } from "@/lib/session";

const getAllTemplates = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const parsedUserId = parseInt(String(userId));
    const db = await getDatabase();
    const templateRepo = db.getRepository(Template);

    const templates = await templateRepo.find({
      where: { userId: parsedUserId },
      order: { isDefault: "DESC", createdAt: "DESC" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { message: "Failed to fetch templates" },
      { status: 500 }
    );
  }
};

export default getAllTemplates;
