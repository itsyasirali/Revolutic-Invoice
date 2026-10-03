import type { DataSource } from "typeorm";
import { Customer } from "@/entities/Customer";
import { TimeEntry } from "@/entities/TimeEntry";
import { HttpError } from "@/lib/requestContext";
import {
  calculateDurationMinutes,
  calculateTimeAmount,
  deriveTimeStatus,
} from "@/utils/timeEntries/timeCalculations";

export interface TimeEntryBody {
  customerId?: string | number | null;
  project?: string;
  projectId?: string | number | null;
  taskId?: string | number | null;
  date?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  hourlyRate?: string | number;
  billable?: boolean | string;
}

export const toBool = (v: unknown) => v === true || v === "true" || v === "1";

export const present = (v: unknown) =>
  v !== undefined && v !== null && v !== "" && v !== "null";

export const assertCustomerInOrg = async (
  db: DataSource,
  customerId: number,
  orgId: number,
) => {
  const customer = await db
    .getRepository(Customer)
    .findOne({ where: { id: customerId, organizationId: orgId } });
  if (!customer) {
    throw new HttpError("Customer not found in this organization", 404);
  }
};

/**
 * Derives duration, amount and status on the server from start/end times and
 * the hourly rate. Any totals sent by the client are ignored.
 */
export const computeTimeFields = (input: {
  startTime: unknown;
  endTime: unknown;
  hourlyRate: unknown;
  billable: boolean;
  invoiced: boolean;
}) => {
  const duration = calculateDurationMinutes(input.startTime, input.endTime);
  if (duration === null) {
    throw new HttpError("Start and end time must be valid (HH:mm) and differ", 400);
  }
  const rate = Number(input.hourlyRate) || 0;
  if (rate < 0) throw new HttpError("Hourly rate must not be negative", 400);
  return {
    duration,
    hourlyRate: rate,
    amount: calculateTimeAmount(rate, duration),
    status: deriveTimeStatus(input.billable, input.invoiced),
  };
};

export const parseDate = (value: unknown): Date => {
  const d = new Date(String(value));
  if (!value || isNaN(d.getTime())) throw new HttpError("Date is required", 400);
  return d;
};

/** Time entries with only non-sensitive user columns (never the password hash/tokens). */
export const timeEntryQuery = (db: DataSource, orgId: number) =>
  db
    .getRepository(TimeEntry)
    .createQueryBuilder("t")
    .leftJoinAndSelect("t.customer", "customer")
    .leftJoinAndSelect("t.invoice", "invoice")
    .leftJoinAndSelect("t.task", "task")
    .leftJoin("t.user", "user")
    .addSelect(["user.id", "user.name", "user.firstName", "user.lastName", "user.email"])
    .where("t.organizationId = :orgId", { orgId });

export const loadTimeEntry = (db: DataSource, id: number, orgId: number) =>
  timeEntryQuery(db, orgId).andWhere("t.id = :id", { id }).getOne();
