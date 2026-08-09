/**
 * `next-auth/jwt`'s `getToken()` already falls back to an `Authorization: Bearer <token>`
 * header when no session cookie is present, decrypting it with `salt: cookieName` (default
 * "authjs.session-token", since no controller passes `secureCookie`). So a mobile-issued
 * token just needs to be encoded with this same salt to be readable by every existing
 * controller's `getToken({ req, secret })` call, with zero changes to those controllers.
 */
export const MOBILE_TOKEN_SALT = "authjs.session-token";
export const MOBILE_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
