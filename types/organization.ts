export const MAX_ORGANIZATIONS_PER_USER = 5;

export interface OrganizationTheme {
  accent: string;
  avatar: string;
  chip: string;
}

export const ORGANIZATION_THEMES: OrganizationTheme[] = [
  {
    accent: "bg-blue-500",
    avatar: "bg-blue-500",
    chip: "bg-blue-50 text-blue-600",
  },
  {
    accent: "bg-violet-500",
    avatar: "bg-violet-500",
    chip: "bg-violet-50 text-violet-600",
  },
  {
    accent: "bg-emerald-500",
    avatar: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-600",
  },
  {
    accent: "bg-amber-500",
    avatar: "bg-amber-500",
    chip: "bg-amber-50 text-amber-600",
  },
  {
    accent: "bg-pink-500",
    avatar: "bg-pink-500",
    chip: "bg-pink-50 text-pink-600",
  },
];

export const getOrganizationTheme = (index: number): OrganizationTheme => {
  const safeIndex =
    ((index % ORGANIZATION_THEMES.length) + ORGANIZATION_THEMES.length) %
    ORGANIZATION_THEMES.length;
  return ORGANIZATION_THEMES[safeIndex];
};

export interface OrganizationData {
  id: number;
  name: string;
  slug?: string | null;
  industry?: string | null;
  businessLocation?: string | null;
  stateProvince?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  zipCode?: string | null;
  address?: string | null;
  currency?: string | null;
  language?: string | null;
  timeZone?: string | null;
  email?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  userId?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateOrganizationPayload {
  name: string;
  industry?: string;
  businessLocation?: string;
  stateProvince?: string;
  streetAddress?: string;
  city?: string;
  zipCode?: string;
  address?: string;
  currency?: string;
  language?: string;
  timeZone?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  website?: string;
}

export interface SwitchOrganizationPayload {
  organizationId: number;
}

export interface OrganizationResponse {
  message?: string;
  organization: OrganizationData | null;
  organizations?: OrganizationData[];
  error?: string;
}

export interface SetupSelectOption {
  value: string;
  label: string;
}

export interface UseOrganizationSetupReturn {
  organizationName: string;
  setOrganizationName: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  handleLocationChange: (val: string) => void;
  province: string;
  setProvince: (val: string) => void;
  provincesList: string[];
  currency: string;
  setCurrency: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  timeZone: string;
  setTimeZone: (val: string) => void;
  showAddress: boolean;
  setShowAddress: (val: boolean | ((prev: boolean) => boolean)) => void;
  streetAddress: string;
  setStreetAddress: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  zipCode: string;
  setZipCode: (val: string) => void;
  loading: boolean;
  error: string | null;
  userName: string;
  isAddingNewOrg: boolean;
  limitReached: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleBack: () => void;
}

export interface UseOrganizationSwitcherReturn {
  organization: OrganizationData | null;
  organizations: OrganizationData[];
  loading: boolean;
  isSwitching: boolean;
  isOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  setIsOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  handleSelectOrg: (orgId: number) => void;
  handleAddNewOrg: () => void;
  handleManageOrgs: () => void;
  pendingOrg: OrganizationData | null;
  confirmSwitch: () => Promise<void>;
  cancelSwitch: () => void;
}
