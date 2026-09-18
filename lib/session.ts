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
  organizationId?: number | null;
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

export const ACTIVE_ORG_COOKIE_NAME = "active_org_id";
// UX-only cookie read by middleware.ts to redirect legacy bare paths; never used for authorization.
export const ACTIVE_ORG_SLUG_COOKIE_NAME = "active_org_slug";

/**
 * Resolves the authenticated organization ID from:
 * 1. x-organization-id header (explicit API client override)
 * 2. active_org_id cookie (switcher immediate state)
 * 3. JWT token organizationId claim
 * 4. Fallback: primary organization for the user from database
 */
export const getAuthOrgId = async (
  req: NextRequest,
): Promise<number | null> => {
  // 1. Check explicit header
  const headerOrgId = req.headers.get("x-organization-id");
  if (headerOrgId) {
    const parsed = parseInt(headerOrgId, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  // 2. Check active organization cookie
  const cookieOrgId = req.cookies.get(ACTIVE_ORG_COOKIE_NAME)?.value;
  if (cookieOrgId) {
    const parsed = parseInt(cookieOrgId, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  // 3. Check JWT token claim
  const token = await getAuthToken(req);
  const rawOrgId = token?.organizationId;
  if (rawOrgId) {
    const parsed = parseInt(String(rawOrgId), 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  // 4. DB Fallback: if user is authenticated but token lacks orgId, resolve from DB
  const rawUserId = token?.id || token?.sub;
  if (rawUserId) {
    const userId = parseInt(String(rawUserId), 10);
    if (!Number.isNaN(userId) && userId > 0) {
      try {
        const { getDatabase } = await import("@/lib/database");
        const { Organization } = await import("@/entities/Organization");
        const db = await getDatabase();
        const orgRepo = db.getRepository(Organization);
        const org = await orgRepo.findOne({
          where: { userId },
          order: { createdAt: "ASC" },
        });
        if (org?.id) return org.id;
      } catch (err) {
        console.error("Failed to fallback-resolve organization from DB:", err);
      }
    }
  }

  return null;
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
    const session = await verifyAuthToken(token);
    if (!session) return null;

    // Check if active_org_id cookie overrides or provides the active organization
    const activeOrgCookie = cookieStore.get(ACTIVE_ORG_COOKIE_NAME)?.value;
    if (activeOrgCookie) {
      const parsedOrg = parseInt(activeOrgCookie, 10);
      if (!Number.isNaN(parsedOrg) && parsedOrg > 0) {
        session.organizationId = parsedOrg;
        return session;
      }
    }

    // Fallback: If session lacks organizationId, resolve from DB
    if (!session.organizationId) {
      const rawUserId = session.id || session.sub;
      if (rawUserId) {
        const userId = parseInt(String(rawUserId), 10);
        if (!Number.isNaN(userId) && userId > 0) {
          try {
            const { getDatabase } = await import("@/lib/database");
            const { Organization } = await import("@/entities/Organization");
            const db = await getDatabase();
            const orgRepo = db.getRepository(Organization);
            const org = await orgRepo.findOne({
              where: { userId },
              order: { createdAt: "ASC" },
            });
            if (org?.id) {
              session.organizationId = org.id;
            }
          } catch (err) {
            console.error("Failed to resolve org for ServerSessionUser:", err);
          }
        }
      }
    }

    return session;
  } catch {
    return null;
  }
};


