import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { hashOtp } from "@/lib/otp";
import {
  AUTH_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
  signAuthToken,
} from "@/lib/session";

// Step 2 of signup: verifies the OTP sent by signup.ts and finalizes the
// pending account into a real, logged-in one.
const signupVerify = async (req: NextRequest) => {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

    const user = await usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (
      !user ||
      !user.pendingSignup ||
      !user.otpCodeHash ||
      !user.otpExpiresAt
    ) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 },
      );
    }

    if (new Date(user.otpExpiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { message: "This code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    const providedHash = hashOtp(String(otp).trim());
    if (providedHash !== user.otpCodeHash) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 },
      );
    }

    user.pendingSignup = false;
    user.emailVerified = new Date();
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    const savedUser = await usersRepository.save(user);

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
        message: "Account created successfully",
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
    console.error("Signup verify error:", error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default signupVerify;
