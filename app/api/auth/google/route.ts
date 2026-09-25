import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Builds the redirect_uri Google should call back on. Must exactly match
// an authorized redirect URI configured in Google Cloud Console.
const getRedirectUri = (req: NextRequest): string => {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  return `${origin}/api/auth/google/callback`;
};

export const GET = async (req: NextRequest) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { message: "Google OAuth is not configured (missing GOOGLE_CLIENT_ID)" },
      { status: 500 },
    );
  }

  // CSRF protection: random state, verified in the callback via a short-lived cookie.
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = getRedirectUri(req);

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("access_type", "online");
  authUrl.searchParams.set("prompt", "select_account");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());

  response.cookies.set({
    name: "google_oauth_state",
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  return response;
};
