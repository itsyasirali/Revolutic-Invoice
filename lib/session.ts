import { NextRequest } from "next/server";
import { getToken, JWT } from "next-auth/jwt";

/**
 * `next-auth/jwt`'s `getToken()` falls back to an `Authorization: Bearer <token>`
 * header when no session cookie is present, decrypting it with `salt: cookieName`.
 */
export const MOBILE_TOKEN_SALT = "authjs.session-token";
export const MOBILE_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Retrieves the NextAuth secret with identical fallbacks to auth.ts
 */
export const getAuthSecret = (): string => {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "fallback-secret-for-development-do-not-use-in-prod"
  );
};

/**
 * Resolves the authenticated JWT session token across HTTPS, HTTP, and mobile Bearer headers.
 */
export const getAuthToken = async (req: NextRequest): Promise<JWT | null> => {
  const secret = getAuthSecret();

  // 1. Determine if connection is secure (direct or forwarded)
  const proto = req.headers.get("x-forwarded-proto");
  const isHttps = req.nextUrl.protocol === "https:" || proto === "https";

  // Check with primary secureCookie setting based on protocol
  let token = await getToken({
    req,
    secret,
    secureCookie: isHttps,
  });

  // 2. If null, check inverse secureCookie setting (covers reverse proxy or dev HTTPS mismatches)
  if (!token) {
    token = await getToken({
      req,
      secret,
      secureCookie: !isHttps,
    });
  }

  // 3. Fallback for specific known session cookie names
  if (!token) {
    const candidateCookies = [
      "__Secure-authjs.session-token",
      "authjs.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.session-token",
    ];
    for (const cookieName of candidateCookies) {
      if (req.cookies.has(cookieName)) {
        try {
          token = await getToken({
            req,
            secret,
            cookieName,
            secureCookie: cookieName.startsWith("__Secure-"),
          });
          if (token) break;
        } catch {
          // ignore decryption mismatch and try next candidate
        }
      }
    }
  }

  // 4. Fallback for mobile / API clients using Authorization: Bearer <token>
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = await getToken({
        req,
        secret,
        cookieName: MOBILE_TOKEN_SALT,
      });
    }
  }

  return token;
};

/**
 * Resolves and validates the authenticated user ID as a positive integer.
 * Returns null if unauthenticated, missing user ID, or invalid integer.
 */
export const getAuthUserId = async (req: NextRequest): Promise<number | null> => {
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
