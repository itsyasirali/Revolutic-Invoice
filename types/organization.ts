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
