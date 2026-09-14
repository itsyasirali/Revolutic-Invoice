import type { SetupSelectOption } from "@/types/organization";

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

export const LOCATIONS: string[] = [
  "Pakistan",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Saudi Arabia",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "Other",
];

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

export const CURRENCIES: SetupSelectOption[] = [
  { value: "PKR", label: "PKR - Pakistani Rupee" },
  { value: "USD", label: "USD - United States Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
];

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
