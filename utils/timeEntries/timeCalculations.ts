import { round2 } from "@/lib/numbering";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const parseTimeToMinutes = (value: unknown): number | null => {
  const m = TIME_RE.exec(String(value ?? "").trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/**
 * Duration in minutes from "HH:mm" start/end. An end earlier than the start
 * is treated as crossing midnight. Returns null for invalid/zero-length input.
 */
export const calculateDurationMinutes = (
  startTime: unknown,
  endTime: unknown,
): number | null => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null || start === end) return null;
  return end > start ? end - start : end + 1440 - start;
};

export const calculateTimeAmount = (hourlyRate: unknown, durationMinutes: number) =>
  round2(((Number(hourlyRate) || 0) * durationMinutes) / 60);

export const deriveTimeStatus = (billable: boolean, invoiced: boolean) =>
  invoiced ? "Invoiced" : billable ? "Unbilled" : "Non-Billable";
