import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/session";

const getMe = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const user = data.user;

  if (!user) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 },
    );
  }

  return NextResponse.json({ user }, { status: 200 });
};

export default getMe;
