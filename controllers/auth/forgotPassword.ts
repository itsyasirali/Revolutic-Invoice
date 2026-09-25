import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import {
  createMailTransporter,
  getMailFromName,
  getMailFromAddress,
  MissingMailConfigError,
} from "@/lib/mailer";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const forgotPassword = async (req: NextRequest) => {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

    const user = await usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    // Always respond with the same generic message, whether or not the
    // account exists, to avoid leaking which emails are registered.
    const genericResponse = {
      message: "If that email exists, a password reset link has been sent.",
    };

    if (!user) {
      return NextResponse.json(genericResponse, { status: 200 });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await usersRepository.save(user);

    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const resetUrl = `${appOrigin}/reset-password?token=${rawToken}&email=${encodeURIComponent(
      normalizedEmail,
    )}`;

    try {
      const transporter = createMailTransporter();
      await transporter.sendMail({
        from: `"${getMailFromName()}" <${getMailFromAddress()}>`,
        to: user.email,
        subject: "Reset your password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <p>Hi ${user.name || "there"},</p>
            <p>We received a request to reset your password. Click the button below to choose a new password. This link expires in 1 hour.</p>
            <p style="margin: 24px 0;">
              <a href="${resetUrl}" style="background:#f97316;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Reset Password</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      if (mailError instanceof MissingMailConfigError) {
        console.error("Password reset email not sent:", mailError.message);
      } else {
        console.error("Failed to send password reset email:", mailError);
      }
      // Do not leak email delivery failures to the client to avoid account enumeration.
    }

    return NextResponse.json(genericResponse, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default forgotPassword;
