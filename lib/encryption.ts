import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import type { ValueTransformer } from "typeorm";

// Field-level AES-256-GCM encryption, applied transparently through TypeORM
// column transformers. Stored format: "enc:v1:<iv>:<tag>:<ciphertext>" (base64).
// Values without the prefix are treated as legacy plaintext and returned as-is,
// so existing rows keep working until scripts/encrypt-existing-data.ts is run.

const PREFIX = "enc:v1:";

let cachedKey: Buffer | null = null;

const getKey = (): Buffer => {
  if (cachedKey) return cachedKey;
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ENCRYPTION_KEY is not configured (32 bytes, base64).");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }
  cachedKey = key;
  return key;
};

export const isEncrypted = (value: unknown): boolean =>
  typeof value === "string" && value.startsWith(PREFIX);

export const encryptString = (plain: string): string => {
  if (isEncrypted(plain)) return plain;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${data.toString("base64")}`;
};

export const decryptString = (stored: string): string => {
  if (!isEncrypted(stored)) return stored;
  const [ivB64, tagB64, dataB64] = stored.slice(PREFIX.length).split(":");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
};

const isNil = (v: unknown): v is null | undefined => v === null || v === undefined;

/** For text / varchar columns. */
export const encryptedText: ValueTransformer = {
  to: (v?: string | null) => (isNil(v) ? v : encryptString(String(v))),
  from: (v?: string | null) => (isNil(v) ? v : decryptString(v)),
};

/** For simple-array (comma separated) columns; the column type must be "text". */
export const encryptedArray: ValueTransformer = {
  to: (v?: string[] | null) =>
    isNil(v) ? v : encryptString(v.join(",")),
  from: (v?: string | string[] | null) => {
    if (isNil(v)) return v;
    if (Array.isArray(v)) return v;
    const plain = decryptString(v);
    return plain === "" ? [] : plain.split(",");
  },
};

/** For jsonb columns; the encrypted payload is stored as a JSON string. */
export const encryptedJson: ValueTransformer = {
  to: (v?: unknown) => (isNil(v) ? v : encryptString(JSON.stringify(v))),
  from: (v?: unknown) => {
    if (isNil(v)) return v;
    // Legacy plaintext rows come back as the original object/array.
    if (typeof v !== "string") return v;
    return JSON.parse(decryptString(v));
  },
};
