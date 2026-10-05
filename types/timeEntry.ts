export type TimeEntryStatus = "Non-Billable" | "Unbilled" | "Invoiced";

export interface TimeEntry {
  id: number;
  entryNumber: string;
  userId: number;
  user?: { id: number; name?: string; firstName?: string; lastName?: string; email?: string } | null;
  customerId?: number | null;
  customer?: { id: number; displayName?: string; companyName?: string; currency?: string } | null;
  project?: string | null;
  projectId?: number | null;
  taskId?: number | null;
  task?: { id: number; name: string } | null;
  invoiceId?: number | null;
  invoice?: { id: number; invoiceNumber: string } | null;
  date: string;
  startTime: string;
  endTime: string;
  /** Minutes (computed server-side). */
  duration: number;
  description?: string | null;
  hourlyRate: number | string;
  amount: number | string;
  billable: boolean;
  invoiced: boolean;
  status: TimeEntryStatus;
  approvalStatus?: "Pending" | "Approved" | "Rejected";
}

export const formatDuration = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes || 0));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};

export const userDisplayName = (u?: TimeEntry["user"]) =>
  u ? u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "" : "";
