import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/session";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";

const getMe = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);

  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

    const user = await usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
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
