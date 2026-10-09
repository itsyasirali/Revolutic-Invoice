const pad = (n: number) => String(n).padStart(2, "0");

/** Today's calendar date as YYYY-MM-DD (server local time). */
export const todayKey = (now: Date = new Date()): string =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/**
 * An invoice is overdue only once its due date is over: due today still counts as
 * on time, and it turns overdue when the next day starts.
 */
export const isPastDue = (dueDate: Date | string | null | undefined, now: Date = new Date()): boolean => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return false;
  return due.toISOString().slice(0, 10) < todayKey(now);
};
