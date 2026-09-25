import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { validatePassword } from "@/lib/validation/password";

const resetPassword = async (req: NextRequest) => {
  try {
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { message: "Email, token, and new password are required" },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

    const user = await usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (
      !user ||
      !user.resetPasswordTokenHash ||
      !user.resetPasswordExpiresAt
    ) {
      return NextResponse.json(
        { message: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    if (new Date(user.resetPasswordExpiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { message: "This reset link has expired. Please request a new one." },
        { status: 400 },
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== user.resetPasswordTokenHash) {
      return NextResponse.json(
        { message: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    await usersRepository.save(user);

    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default resetPassword;
