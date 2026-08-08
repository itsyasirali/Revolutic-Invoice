import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { LoginPayload } from "@/types/auth";
import { readSession, writeSession } from "@/lib/session";

const login = async (req: NextRequest) => {
  try {
    const { email, password }: LoginPayload = await req.json();

    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

    const user = await usersRepository.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const sessionUser = { id: user.id, name: user.name, email: user.email };

    const response = NextResponse.json(
      { message: "Login successful", user: sessionUser },
      { status: 200 },
    );

    const { sid } = await readSession(req);
    await writeSession(response, sid, { user: sessionUser });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default login;
