export interface OrganizationData {
  id: number;
  name: string;
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
  handleSelectOrg: (orgId: number) => Promise<void>;
  handleAddNewOrg: () => void;
}

