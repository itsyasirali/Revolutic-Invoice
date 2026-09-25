import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { Organization } from "@/entities/Organization";
import {
  AUTH_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
  signAuthToken,
} from "@/lib/session";

const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const otpVerify = async (req: NextRequest) => {
  try {
    const { email, otp, name } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersRepository = db.getRepository(User);
    const orgRepository = db.getRepository(Organization);

    const user = await usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
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

    // Consume the OTP and finalize the account (in case it was a
    // passwordless pending record created by otpRequest.ts).
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    if (name && typeof name === "string" && !user.name) {
      user.name = name.trim();
    }
    const savedUser = await usersRepository.save(user);

    const organization = await orgRepository.findOne({
      where: { userId: savedUser.id },
      order: { createdAt: "ASC" },
    });

    const sessionPayload = {
      id: savedUser.id.toString(),
      name:
        savedUser.name ||
        `${savedUser.firstName || ""} ${savedUser.lastName || ""}`.trim() ||
        null,
      email: savedUser.email,
      companyName: savedUser.companyName || null,
      firstName: savedUser.firstName || null,
      lastName: savedUser.lastName || null,
      organizationId: organization?.id ?? null,
    };

    const token = await signAuthToken(sessionPayload);

    const response = NextResponse.json(
      {
        message: "Signed in successfully",
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          companyName: organization?.name || savedUser.companyName,
          organizationId: organization?.id ?? null,
          organization: organization ?? null,
        },
        token,
      },
      { status: 200 },
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
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default otpVerify;
