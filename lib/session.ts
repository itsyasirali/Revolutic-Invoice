import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "auth_token";
export const TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface AuthUserSession {
  id: string | number;
  email: string;
  name?: string | null;
  companyName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  [key: string]: unknown;
}

let cachedAuthSecret: Uint8Array | null = null;

/**
 * Retrieves the signing secret as a Uint8Array for jose.
 */
export const getAuthSecret = (): Uint8Array => {
  if (cachedAuthSecret) return cachedAuthSecret;
  const secretStr =
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "fallback-secret-for-development-do-not-use-in-prod";
  cachedAuthSecret = new TextEncoder().encode(secretStr);
  return cachedAuthSecret;
};

/**
 * Signs a standard JWT with HS256 algorithm.
 */
export const signAuthToken = async (
  payload: AuthUserSession,
  maxAgeSeconds: number = TOKEN_MAX_AGE_SECONDS,
): Promise<string> => {
  const secret = getAuthSecret();
  const rawId = String(payload.id);

  return new SignJWT({
    ...payload,
    id: rawId,
    sub: rawId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secret);
};

/**
 * Verifies and decodes a JWT token. Returns null if invalid or expired.
 */
export const verifyAuthToken = async (
  token: string,
): Promise<AuthUserSession | null> => {
  try {
    if (!token || typeof token !== "string") return null;
    const secret = getAuthSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthUserSession;
  } catch {
    return null;
  }
};

/**
 * Resolves the authenticated user session from NextRequest.
 * Supports:
 * 1. Authorization: Bearer <token> header (Mobile apps, API clients)
 * 2. auth_token HTTP-only cookie (Web browser clients)
 */
export const getAuthToken = async (
  req: NextRequest,
): Promise<AuthUserSession | null> => {
  // 1. Check Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) {
      const verified = await verifyAuthToken(bearerToken);
      if (verified) return verified;
    }
  }

  // 2. Check primary session cookie
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (sessionCookie) {
    const verified = await verifyAuthToken(sessionCookie);
    if (verified) return verified;
  }

  return null;
};

/**
 * Resolves and validates the authenticated user ID as a positive integer.
 * Returns null if unauthenticated, missing user ID, or invalid integer.
 */
export const getAuthUserId = async (
  req: NextRequest,
): Promise<number | null> => {
  const token = await getAuthToken(req);
  const rawId = token?.id || token?.sub;
  if (!rawId) {
    return null;
  }

  const parsed = parseInt(String(rawId), 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

/**
 * Resolves the authenticated session inside React Server Components
 * using cookies() from next/headers.
 */
export const getServerSessionUser = async (): Promise<AuthUserSession | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
};

/**
 * Cookie options for setting and clearing the auth session cookie.
 */
export const getSessionCookieOptions = (maxAge: number = TOKEN_MAX_AGE_SECONDS) => ({
  name: AUTH_COOKIE_NAME,
  value: "",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});
