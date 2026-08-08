import { NextRequest, NextResponse } from "next/server";
import { readSession, destroySession } from "@/lib/session";

const logout = async (req: NextRequest) => {
  try {
    const { sid } = await readSession(req);
    await destroySession(sid);
    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Could not log out" },
      { status: 500 },
    );
  }
};

export default logout;
