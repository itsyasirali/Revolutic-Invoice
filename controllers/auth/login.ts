import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { encode } from "next-auth/jwt";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { LoginPayload } from "@/types/auth";
import { MOBILE_TOKEN_MAX_AGE, MOBILE_TOKEN_SALT } from "@/lib/session";

const login = async (req: NextRequest) => {
  try {
    const { email, password }: LoginPayload = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

    const user = await usersRepository.findOneBy({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = await encode({
      token: {
        id: user.id.toString(),
        name:
          user.name ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          null,
        email: user.email,
        companyName: user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      secret:
        process.env.AUTH_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        "fallback-secret-for-development-do-not-use-in-prod",
      salt: MOBILE_TOKEN_SALT,
      maxAge: MOBILE_TOKEN_MAX_AGE,
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default login;
