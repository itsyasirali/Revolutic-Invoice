import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";
import { Organization } from "@/entities/Organization";
import {
  AUTH_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
  signAuthToken,
} from "@/lib/session";

const getRedirectUri = (req: NextRequest): string => {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  return `${origin}/api/auth/google/callback`;
};

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export const GET = async (req: NextRequest) => {
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const loginErrorUrl = new URL("/login", appOrigin);

  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const storedState = req.cookies.get("google_oauth_state")?.value;
    const oauthError = req.nextUrl.searchParams.get("error");

    if (oauthError) {
      loginErrorUrl.searchParams.set("error", "google_oauth_denied");
      return NextResponse.redirect(loginErrorUrl);
    }

    if (!code || !state || !storedState || state !== storedState) {
      loginErrorUrl.searchParams.set("error", "google_oauth_invalid_state");
      return NextResponse.redirect(loginErrorUrl);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Google OAuth is not configured: missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET");
      loginErrorUrl.searchParams.set("error", "google_oauth_not_configured");
      return NextResponse.redirect(loginErrorUrl);
    }

    const redirectUri = getRedirectUri(req);

    // Exchange the authorization code for tokens.
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData.error_description || tokenData.error);
      loginErrorUrl.searchParams.set("error", "google_oauth_token_exchange_failed");
      return NextResponse.redirect(loginErrorUrl);
    }

    // Fetch the authenticated user's profile.
    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );

    if (!profileResponse.ok) {
      console.error("Failed to fetch Google user profile");
      loginErrorUrl.searchParams.set("error", "google_oauth_profile_fetch_failed");
      return NextResponse.redirect(loginErrorUrl);
    }

    const profile: GoogleUserInfo = await profileResponse.json();

    if (!profile.email) {
      loginErrorUrl.searchParams.set("error", "google_oauth_no_email");
      return NextResponse.redirect(loginErrorUrl);
    }

    const normalizedEmail = profile.email.trim().toLowerCase();

    const db = await getDatabase();
    const usersRepository = db.getRepository(User);
    const orgRepository = db.getRepository(Organization);

    let user = await usersRepository.findOneBy({ email: normalizedEmail });

    if (!user) {
      const newUser = usersRepository.create({
        name: profile.name || normalizedEmail,
        firstName: profile.given_name || undefined,
        lastName: profile.family_name || undefined,
        email: normalizedEmail,
        // No password: this account authenticates via Google only.
        password: undefined,
        image: profile.picture || undefined,
        emailVerified: profile.email_verified ? new Date() : undefined,
      });
      user = await usersRepository.save(newUser);
    }

    const organization = await orgRepository.findOne({
      where: { userId: user.id },
      order: { createdAt: "ASC" },
    });

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
      organizationId: organization?.id ?? null,
    };

    const token = await signAuthToken(sessionPayload);

    const redirectUrl = organization?.slug
      ? new URL(`/${organization.slug}/dashboard`, appOrigin)
      : new URL("/organization-setup", appOrigin);

    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
    });

    // Clear the one-time CSRF state cookie.
    response.cookies.set({
      name: "google_oauth_state",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    loginErrorUrl.searchParams.set("error", "google_oauth_failed");
    return NextResponse.redirect(loginErrorUrl);
  }
};
