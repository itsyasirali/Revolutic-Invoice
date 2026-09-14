import type { SetupSelectOption } from "@/types/organization";
import { COUNTRY_NAMES, UNIQUE_CURRENCIES } from "./countries";

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

export const PROVINCES: string[] = [
  "State/Province",
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
  "Other",
];

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

export const TIMEZONES: string[] = [
  "(GMT 5:00) Pakistan Time (Asia/Karachi)",
  "(GMT 0:00) Greenwich Mean Time (Europe/London)",
  "(GMT -5:00) Eastern Time (US & Canada)",
  "(GMT -8:00) Pacific Time (US & Canada)",
  "(GMT +4:00) Gulf Standard Time (Asia/Dubai)",
  "(GMT +3:00) Arabian Standard Time (Asia/Riyadh)",
  "(GMT +1:00) Central European Time (Europe/Paris)",
];
