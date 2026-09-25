import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { SignupPayload } from "@/types/auth";
import { validatePassword } from "@/lib/validation/password";
import {
  AUTH_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
  signAuthToken,
} from "@/lib/session";

const signup = async (req: NextRequest) => {
  try {
    const { name, email, password }: SignupPayload = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

    const userExist = await usersRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (userExist) {
      return NextResponse.json(
        { message: "This email already exists in the record" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = usersRepository.create({
      name: name?.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });
    const savedUser = await usersRepository.save(newUser);

    const sessionPayload = {
      id: savedUser.id.toString(),
      name: savedUser.name || null,
      email: savedUser.email,
      companyName: savedUser.companyName || null,
      firstName: savedUser.firstName || null,
      lastName: savedUser.lastName || null,
      organizationId: null,
    };

    const token = await signAuthToken(sessionPayload);

    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          organizationId: null,
        },
        token,
      },
      { status: 201 },
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default signup;
