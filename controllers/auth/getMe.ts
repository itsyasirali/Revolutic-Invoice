import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { Organization } from "@/entities/Organization";

const getMe = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);

  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const usersRepository = db.getRepository(User);
    const orgRepository = db.getRepository(Organization);

    const [user, org] = await Promise.all([
      usersRepository.findOne({
        where: { id: userId },
      }),
      orgRepository.findOne({
        where: { userId },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        companyName: org?.name || user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: org?.id || null,
        organization: org || null,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 },
    );
  }
};

export default getMe;
