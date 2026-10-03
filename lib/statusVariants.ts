import type { BadgeVariant } from "@/types/common";

const MAP: Record<string, BadgeVariant> = {
  // billing state (expenses / time)
  unbilled: "warning",
  invoiced: "success",
  "non-billable": "gray",
  // projects
  active: "success",
  "on hold": "warning",
  completed: "muted",
  // quotes
  draft: "gray",
  sent: "info",
  viewed: "primary",
  accepted: "success",
  declined: "danger",
  expired: "warning",
  converted: "muted",
};

export const statusVariant = (status?: string): BadgeVariant =>
  MAP[(status || "").toLowerCase()] || "default";
