import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { Organization } from "@/entities/Organization";
import { signAuthToken } from "@/lib/session";

interface GoogleTokenInfo {
  iss?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  exp?: string;
  error_description?: string;
}

/**
 * POST /api/auth/google/mobile  { idToken }
 * Google sign-in for the mobile app. The app signs in with Google on the phone
 * (no browser) and sends the ID token Google gave it. We ask Google to verify it,
 * check it was issued for our client, then log the user in (creating the account
 * on first use), returning the same shape as POST /api/auth/login.
 */
export const POST = async (req: NextRequest) => {
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ message: "Missing Google token" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ message: "Google sign-in is not configured on the server" }, { status: 500 });
    }

    // Google verifies the signature and expiry for us.
    const verify = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    const info: GoogleTokenInfo = await verify.json();
    if (!verify.ok || !info.email) {
      return NextResponse.json({ message: "Google sign-in could not be verified" }, { status: 401 });
    }
    if (info.aud !== clientId) {
      return NextResponse.json({ message: "This Google token is not for this app" }, { status: 401 });
    }
    if (info.iss !== "accounts.google.com" && info.iss !== "https://accounts.google.com") {
      return NextResponse.json({ message: "Invalid Google token issuer" }, { status: 401 });
    }
    if (String(info.email_verified) !== "true") {
      return NextResponse.json({ message: "Your Google email is not verified" }, { status: 401 });
    }

    const email = info.email.trim().toLowerCase();
    const db = await getDatabase();
    const usersRepository = db.getRepository(User);

    let user = await usersRepository.findOneBy({ email });
    if (!user) {
      user = await usersRepository.save(
        usersRepository.create({
          name: info.name || email,
          firstName: info.given_name || undefined,
          lastName: info.family_name || undefined,
          email,
          // No password: this account authenticates via Google only.
          password: undefined,
          image: info.picture || undefined,
          emailVerified: new Date(),
        }),
      );
    } else if (user.pendingSignup) {
      return NextResponse.json({ message: "Please verify your email to finish creating your account." }, { status: 403 });
    }

    const organization = await db.getRepository(Organization).findOne({
      where: { userId: user.id },
      order: { createdAt: "ASC" },
    });

    const token = await signAuthToken({
      id: user.id.toString(),
      name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      email: user.email,
      companyName: user.companyName,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: organization?.id ?? null,
    });

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        companyName: organization?.name || user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image ?? null,
        organizationId: organization?.id ?? null,
        organization: organization ?? null,
      },
      token,
    });
  } catch (error) {
    console.error("Google mobile sign-in error:", error);
    return NextResponse.json({ message: "Google sign-in failed" }, { status: 500 });
  }
};
