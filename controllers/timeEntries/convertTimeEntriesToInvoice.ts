import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { TimeEntry } from "@/entities/TimeEntry";
import { Customer } from "@/entities/Customer";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { createInvoiceRecord } from "@/controllers/invoices/createInvoice";
import {
  claimAllOrFail,
  releaseClaim,
  linkToInvoice,
  parseIds,
} from "@/lib/services/billingService";
import { round2 } from "@/lib/numbering";

/**
 * POST /api/time-tracking/invoice  { timeEntryIds: number[], dueDate?, templateId?, currency? }
 * Billable, un-invoiced entries of one customer -> one invoice; one line per entry.
 */
const convertTimeEntriesToInvoice = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;

  try {
    const body = (await req.json()) as {
      timeEntryIds?: unknown;
      dueDate?: string;
      templateId?: number;
      currency?: string;
    };
    const ids = parseIds(body.timeEntryIds);

    const db = await getDatabase();
    const claimed = await claimAllOrFail(db, "time_entries", orgId, ids, "time entries");

    try {
      const entries = await db.getRepository(TimeEntry).find({
        where: { id: In(claimed), organizationId: orgId },
        order: { date: "ASC", id: "ASC" },
      });

      const customerIds = new Set(entries.map((e) => e.customerId));
      if (customerIds.size !== 1 || !entries[0].customerId) {
        throw new HttpError("Select billable time entries of a single customer", 400);
      }

      const customer = await db.getRepository(Customer).findOne({
        where: { id: entries[0].customerId, organizationId: orgId },
      });
      if (!customer) throw new HttpError("Customer not found in this organization", 404);

      const invoice = await createInvoiceRecord(
        userId,
        {
          customerId: entries[0].customerId,
          templateId: body.templateId,
          invoiceNumber: "",
          invoiceDate: new Date().toISOString(),
          dueDate: body.dueDate,
          currency: body.currency || customer.currency,
          items: entries.map((e) => ({
            itemId: null,
            title: e.project || "Time",
            description: [
              e.entryNumber,
              new Date(e.date).toLocaleDateString("en-GB"),
              e.description,
            ]
              .filter(Boolean)
              .join(" - "),
            // quantity in hours; amount is the server-stored rate x duration.
            quantity: round2(e.duration / 60),
            rate: Number(e.hourlyRate),
            amount: Number(e.amount),
          })),
        } as unknown as Parameters<typeof createInvoiceRecord>[1],
        orgId,
      );

      await linkToInvoice(db, "time_entries", claimed, invoice.id);
      return NextResponse.json(
        { message: "Invoice created from time entries", invoice },
        { status: 201 },
      );
    } catch (inner) {
      await releaseClaim(db, "time_entries", claimed);
      throw inner;
    }
  } catch (error) {
    return errorResponse(error, "Failed to convert time entries to invoice");
  }
};

export default convertTimeEntriesToInvoice;
