import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Organization } from "@/entities/Organization";
import { getAuthUserId } from "@/lib/session";

const getOrganization = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const orgRepo = db.getRepository(Organization);

    const organization = await orgRepo.findOne({
      where: { userId },
      order: { createdAt: "ASC" },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "No organization found", organization: null },
        { status: 200 },
      );
    }

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { message: "Failed to fetch organization", error: error?.message },
      { status: 500 },
    );
  }
};

export default getOrganization;
