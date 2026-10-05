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

/** Units plus the current value when it's a custom one (e.g. "hrs"), so it isn't lost. */
export const unitOptions = (current?: string | null): string[] => {
  const value = (current ?? "").trim();
  return value && !(UNITS as readonly string[]).includes(value) ? [...UNITS, value].sort() : [...UNITS];
};
