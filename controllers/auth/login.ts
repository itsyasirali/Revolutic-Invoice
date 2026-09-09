import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { LoginPayload } from "@/types/auth";
import {
  AUTH_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
  signAuthToken,
} from "@/lib/session";

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

    const user = await usersRepository.findOneBy({ email: email.trim().toLowerCase() });
    if (!user || !user.password) {
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

    const sessionPayload = {
      id: user.id.toString(),
      name:
        user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        null,
      email: user.email,
      companyName: user.companyName,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = await signAuthToken(sessionPayload);

    const response = NextResponse.json(
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

    // Set HTTP-only session cookie for Web browsers
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default login;
