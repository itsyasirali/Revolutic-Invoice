export interface PortalSettings {
  enabled: boolean;
  portalName: string;
  bannerMessage: string;
  welcomeMessage: string;
  canViewInvoices: boolean;
  canViewQuotes: boolean;
  canViewPayments: boolean;
  canViewProjects: boolean;
  canViewTimesheets: boolean;
  canApproveTimesheets: boolean;
  canComment: boolean;
  canEditProfile: boolean;
  /** Billable time must be approved by the customer before it can be invoiced. */
  requireTimeApproval: boolean;
  notify: {
    invoiceViewed: boolean;
    quoteViewed: boolean;
    quoteAccepted: boolean;
    quoteDeclined: boolean;
    comment: boolean;
    timeApproval: boolean;
    profileUpdated: boolean;
  };
}

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  enabled: true,
  portalName: "",
  bannerMessage: "",
  welcomeMessage: "",
  canViewInvoices: true,
  canViewQuotes: true,
  canViewPayments: true,
  canViewProjects: true,
  canViewTimesheets: true,
  canApproveTimesheets: true,
  canComment: true,
  canEditProfile: true,
  requireTimeApproval: false,
  notify: {
    invoiceViewed: true,
    quoteViewed: true,
    quoteAccepted: true,
    quoteDeclined: true,
    comment: true,
    timeApproval: true,
    profileUpdated: true,
  },
};

/** Merges stored (possibly partial / older) settings over the defaults. */
export const resolvePortalSettings = (stored?: Partial<PortalSettings> | null): PortalSettings => ({
  ...DEFAULT_PORTAL_SETTINGS,
  ...(stored || {}),
  notify: { ...DEFAULT_PORTAL_SETTINGS.notify, ...(stored?.notify || {}) },
});

export type PortalPermission = Exclude<
  keyof PortalSettings,
  "enabled" | "portalName" | "bannerMessage" | "welcomeMessage" | "notify" | "requireTimeApproval"
>;

export type PortalActivityType =
  | "invoice_viewed"
  | "quote_viewed"
  | "quote_accepted"
  | "quote_declined"
  | "comment_added"
  | "time_approved"
  | "time_rejected"
  | "profile_updated";

export const ACTIVITY_NOTIFY_KEY: Record<PortalActivityType, keyof PortalSettings["notify"]> = {
  invoice_viewed: "invoiceViewed",
  quote_viewed: "quoteViewed",
  quote_accepted: "quoteAccepted",
  quote_declined: "quoteDeclined",
  comment_added: "comment",
  time_approved: "timeApproval",
  time_rejected: "timeApproval",
  profile_updated: "profileUpdated",
};

export interface PortalComment {
  id: number;
  entityType: "invoice" | "quote";
  entityId: number;
  authorType: "customer" | "business";
  authorName?: string | null;
  message: string;
  visibleToCustomer?: boolean;
  createdAt: string;
}

export interface PortalMe {
  user: { id: number; email: string; name?: string | null };
  customer: {
    id: number;
    displayName: string;
    companyName?: string | null;
    currency: string;
    address?: string | null;
    contacts: { firstName?: string; lastName?: string; email?: string; contact?: string }[];
  };
  organization: { id: number; name: string; logoUrl?: string | null; email?: string | null; phone?: string | null };
  settings: PortalSettings;
}
