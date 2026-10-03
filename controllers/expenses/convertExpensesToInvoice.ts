import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Expense } from "@/entities/Expense";
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
 * POST /api/expenses/invoice  { expenseIds: number[], dueDate?, templateId? }
 * Expense -> Invoice Item -> Expense marked as invoiced. Each expense becomes
 * exactly one invoice line carrying its total (amount + tax), once.
 */
const convertExpensesToInvoice = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;

  try {
    const body = (await req.json()) as {
      expenseIds?: unknown;
      dueDate?: string;
      templateId?: number;
    };
    const ids = parseIds(body.expenseIds);

    const db = await getDatabase();
    const claimed = await claimAllOrFail(db, "expenses", orgId, ids, "expenses");

    try {
      const expenses = await db.getRepository(Expense).find({
        where: { id: In(claimed), organizationId: orgId },
        relations: ["category"],
        order: { expenseDate: "ASC", id: "ASC" },
      });

      const customerIds = new Set(expenses.map((e) => e.customerId));
      if (customerIds.size !== 1 || !expenses[0].customerId) {
        throw new HttpError("Select billable expenses of a single customer", 400);
      }
      const currencies = new Set(expenses.map((e) => e.currency));
      if (currencies.size !== 1) {
        throw new HttpError("Select expenses that share the same currency", 400);
      }

      const invoice = await createInvoiceRecord(
        userId,
        {
          customerId: expenses[0].customerId,
          templateId: body.templateId,
          invoiceNumber: "",
          invoiceDate: new Date().toISOString(),
          dueDate: body.dueDate,
          currency: expenses[0].currency,
          items: expenses.map((e) => ({
            itemId: null,
            title: e.category?.name || e.vendor || "Expense",
            description: [e.expenseNumber, e.vendor, e.description]
              .filter(Boolean)
              .join(" - "),
            quantity: 1,
            rate: round2(Number(e.total)),
            amount: round2(Number(e.total)),
          })),
        } as unknown as Parameters<typeof createInvoiceRecord>[1],
        orgId,
      );

      await linkToInvoice(db, "expenses", claimed, invoice.id);
      return NextResponse.json(
        { message: "Invoice created from expenses", invoice },
        { status: 201 },
      );
    } catch (inner) {
      await releaseClaim(db, "expenses", claimed);
      throw inner;
    }
  } catch (error) {
    return errorResponse(error, "Failed to convert expenses to invoice");
  }
};

export default convertExpensesToInvoice;
