export type PlaceholderValues = Record<string, string>;

/** Hidden key: ISO date that %(MONTH-1)% style expressions are relative to. */
export const BASE_DATE_KEY = "__baseDate";

const PATTERN = /%([A-Za-z][A-Za-z0-9_]*)%/g;
const EXPR_PATTERN = /%\(\s*([A-Za-z]+)\s*([+-])\s*(\d{1,3})\s*\)%/g;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Computes MONTH / MONTHNAME / MONTHSHORT / MONTHNUM / YEAR / DAY shifted by `delta`. */
export const shiftDatePart = (
  base: Date,
  unit: string,
  delta: number,
): string | null => {
  switch (unit.toUpperCase()) {
    case "MONTH":
    case "MONTHNAME": {
      const d = new Date(base.getFullYear(), base.getMonth() + delta, 1);
      return d.toLocaleString("en-US", { month: "long" });
    }
    case "MONTHSHORT": {
      const d = new Date(base.getFullYear(), base.getMonth() + delta, 1);
      return d.toLocaleString("en-US", { month: "short" });
    }
    case "MONTHNUM": {
      const d = new Date(base.getFullYear(), base.getMonth() + delta, 1);
      return pad2(d.getMonth() + 1);
    }
    case "YEAR":
      return String(base.getFullYear() + delta);
    case "DAY": {
      const d = new Date(base);
      d.setDate(d.getDate() + delta);
      return pad2(d.getDate());
    }
    default:
      return null;
  }
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Replaces %Key% tokens and %(MONTH-1)% style date expressions. Unknown keys
 * are left untouched; known keys with an empty value become blank. Substituted
 * values are never re-scanned.
 */
export const replacePlaceholders = (
  text: string | null | undefined,
  values: PlaceholderValues,
  opts: { html?: boolean } = {},
): string => {
  if (!text) return "";
  const out = (v: string) => (opts.html ? escapeHtml(v) : v);
  const baseIso = values[BASE_DATE_KEY];
  const base = baseIso ? new Date(baseIso) : new Date();

  // Split on expressions first so already-substituted output is never re-scanned.
  let result = "";
  let last = 0;
  for (const m of text.matchAll(EXPR_PATTERN)) {
    const idx = m.index ?? 0;
    result += replaceKeys(text.slice(last, idx), values, out);
    const delta = (m[2] === "-" ? -1 : 1) * Number(m[3]);
    const shifted = isNaN(base.getTime()) ? null : shiftDatePart(base, m[1], delta);
    result += shifted === null ? m[0] : out(shifted);
    last = idx + m[0].length;
  }
  return result + replaceKeys(text.slice(last), values, out);
};

const replaceKeys = (
  text: string,
  values: PlaceholderValues,
  out: (v: string) => string,
): string =>
  text.replace(PATTERN, (match, key: string) => {
    if (key === BASE_DATE_KEY || !Object.prototype.hasOwnProperty.call(values, key)) {
      return match;
    }
    return out(values[key] ?? "");
  });
