import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { SignupPayload } from "@/types/auth";
import { validatePassword } from "@/lib/validation/password";
import { OTP_TTL_MS, generateOtp, hashOtp, sendOtpEmail } from "@/lib/otp";

// Step 1 of signup: validates the submitted details, stashes a pending
// (unverified) account holding the hashed password, and emails an OTP.
// The account only becomes real once verified via signupVerify.ts.
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

    const existingUser = await usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    // A "real" account is one that already has a password and isn't itself
    // still awaiting OTP verification. Anything else (no account yet, or a
    // passwordless OTP-login stub, or a previous incomplete signup attempt)
    // can be (re)claimed by this signup.
    const isRealExistingAccount =
      existingUser && existingUser.password && !existingUser.pendingSignup;

    if (isRealExistingAccount) {
      return NextResponse.json(
        { message: "This email already exists in the record" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpCodeHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    const pendingUser = usersRepository.create({
      ...existingUser,
      email: normalizedEmail,
      name: name?.trim(),
      password: hashedPassword,
      pendingSignup: true,
      otpCodeHash,
      otpExpiresAt,
    });
    await usersRepository.save(pendingUser);

    try {
      await sendOtpEmail(normalizedEmail, otp, {
        subject: "Verify your email to finish signing up",
        intro: "Your account verification code is:",
      });
    } catch {
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Server error, please try again later" },
      { status: 500 },
    );
  }
};

export default signup;
