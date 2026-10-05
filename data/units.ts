/** Standard units offered in the item Unit dropdown (alphabetical). */
export const UNITS = [
  "box",
  "cm",
  "dz",
  "ft",
  "g",
  "in",
  "kg",
  "km",
  "lb",
  "m",
  "mg",
  "ml",
  "pcs",
] as const;

/** Time-based units offered for Service items (hourly, monthly, ...). */
export const SERVICE_UNITS = ["hour", "day", "week", "month", "year"] as const;

/**
 * Units for the dropdown: Goods get the physical units, Services the time-based ones.
 * Without a type, both lists are returned. The current value is always kept, even a
 * custom one (e.g. "hrs"), so it isn't lost.
 */
export const unitOptions = (current?: string | null, type?: "Goods" | "Service"): string[] => {
  const base: readonly string[] =
    type === "Service" ? SERVICE_UNITS : type === "Goods" ? UNITS : [...UNITS, ...SERVICE_UNITS];
  const value = (current ?? "").trim();
  return value && !base.includes(value) ? [...base, value].sort() : [...base];
};
