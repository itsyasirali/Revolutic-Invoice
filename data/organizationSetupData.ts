import type { SetupSelectOption } from "@/types/organization";
import {
  COUNTRY_NAMES,
  UNIQUE_CURRENCIES,
  GLOBAL_TIMEZONES,
  getStatesForCountry,
  getTimezoneForCountry,
  getCurrencyForCountry,
} from "./countries";

export { getStatesForCountry, getTimezoneForCountry, getCurrencyForCountry };

export const INDUSTRIES: string[] = [
  "Web Development",
  "Software & Technology",
  "Consulting & Professional Services",
  "Design, Agency & Media",
  "Retail & E-commerce",
  "Financial Services & Accounting",
  "Construction & Real Estate",
  "Healthcare & Wellness",
  "Education & Training",
  "Other",
];

// Derived directly from the countries dataset
export const LOCATIONS: string[] = [...COUNTRY_NAMES, "Other"];

// Default initial provinces (for Pakistan)

// Derived directly from the countries dataset
export const CURRENCIES: SetupSelectOption[] = UNIQUE_CURRENCIES.map((c) => ({
  value: c.value,
  label: c.label,
}));

export const LANGUAGES: string[] = [
  "English",
  "Urdu",
  "Arabic",
  "Spanish",
  "French",
  "German",
];

export const TIMEZONES: string[] = GLOBAL_TIMEZONES;
