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

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const otpRequest = async (req: NextRequest) => {
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

    let user = await usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    // For a brand-new email we don't create the user yet — the account is
    // only created once the OTP is verified (see otpVerify.ts).
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpCodeHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    if (user) {
      user.otpCodeHash = otpCodeHash;
      user.otpExpiresAt = otpExpiresAt;
      await usersRepository.save(user);
    } else {
      // Stash a pending (passwordless) user record holding only the OTP.
      // It becomes a real account once verified in otpVerify.ts.
      const pendingUser = usersRepository.create({
        email: normalizedEmail,
        otpCodeHash,
        otpExpiresAt,
      });
      user = await usersRepository.save(pendingUser);
    }

    try {
      const transporter = createMailTransporter();
      await transporter.sendMail({
        from: `"${getMailFromName()}" <${getMailFromAddress()}>`,
        to: normalizedEmail,
        subject: "Your sign-in code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <p>Your one-time sign-in code is:</p>
            <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
            <p>This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      if (mailError instanceof MissingMailConfigError) {
        console.error("OTP email not sent:", mailError.message);
      } else {
        console.error("Failed to send OTP email:", mailError);
      }
      return NextResponse.json(
        { message: "Failed to send verification code. Please try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { message: "A verification code has been sent to your email." },
      { status: 200 },
    );
  } catch (error) {
    console.error("OTP request error:", error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default otpRequest;
