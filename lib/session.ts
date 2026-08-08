import { randomBytes } from "crypto";
import { sign, unsign } from "cookie-signature";
import type { NextRequest, NextResponse } from "next/server";
import { getPgPool } from "@/lib/database";

// Behavior-preserving shim for the old NestJS backend's express-session +
// connect-pg-simple setup: same cookie name, same signing scheme, same
// Postgres-backed session table/columns, same 30-day/httpOnly/secure-in-prod
// cookie attributes. Route Handlers can't run Express middleware, so session
// read/write/destroy is done explicitly per-request instead of implicitly.

const COOKIE_NAME = "connect.sid";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_SECRET = process.env.SESSION_SECRET as string;

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export interface SessionData {
  user?: SessionUser;
}

let sessionTableReady: Promise<void> | null = null;

const ensureSessionTable = async (): Promise<void> => {
  if (!sessionTableReady) {
    const pool = getPgPool();
    sessionTableReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS "session" (
          "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL
        )`,
      )
      .then(() =>
        pool.query(
          `CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")`,
        ),
      )
      .then(() => undefined);
  }
  return sessionTableReady;
};

const genSessionId = (): string => randomBytes(24).toString("base64url");

const readCookie = (req: NextRequest): string | null => {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const writeCookie = (
  res: NextResponse,
  sid: string,
  secure: boolean,
): void => {
  const signed = "s:" + sign(sid, SESSION_SECRET);
  res.cookies.set(COOKIE_NAME, encodeURIComponent(signed), {
    maxAge: MAX_AGE_MS / 1000,
    httpOnly: true,
    secure,
    path: "/",
  });
};

/** Reads the current session (or an empty one if absent/expired/invalid). */
export const readSession = async (
  req: NextRequest,
): Promise<{ sid: string | null; data: SessionData }> => {
  await ensureSessionTable();

  const cookieVal = readCookie(req);
  if (!cookieVal || !cookieVal.startsWith("s:")) {
    return { sid: null, data: {} };
  }

  const sid = unsign(cookieVal.slice(2), SESSION_SECRET);
  if (!sid) {
    return { sid: null, data: {} };
  }

  const pool = getPgPool();
  const result = await pool.query(
    `SELECT sess FROM "session" WHERE sid = $1 AND expire >= now()`,
    [sid],
  );

  if (result.rows.length === 0) {
    return { sid, data: {} };
  }

  return { sid, data: (result.rows[0].sess as SessionData) ?? {} };
};

/**
 * Persists session data (matches saveUninitialized:false — a row is only
 * written when there is actual data to store) and (re)issues the cookie.
 */
export const writeSession = async (
  res: NextResponse,
  sid: string | null,
  data: SessionData,
): Promise<string> => {
  await ensureSessionTable();

  const effectiveSid = sid ?? genSessionId();
  const expire = new Date(Date.now() + MAX_AGE_MS);
  const pool = getPgPool();

  await pool.query(
    `INSERT INTO "session" (sid, sess, expire) VALUES ($1, $2, $3)
     ON CONFLICT (sid) DO UPDATE SET sess = $2, expire = $3`,
    [effectiveSid, JSON.stringify(data), expire],
  );

  writeCookie(res, effectiveSid, process.env.NODE_ENV === "production");

  return effectiveSid;
};

/** Destroys the session row (mirrors req.session.destroy() — cookie itself is not explicitly cleared, matching original logout behavior). */
export const destroySession = async (sid: string | null): Promise<void> => {
  if (!sid) return;
  await ensureSessionTable();
  const pool = getPgPool();
  await pool.query(`DELETE FROM "session" WHERE sid = $1`, [sid]);
};
