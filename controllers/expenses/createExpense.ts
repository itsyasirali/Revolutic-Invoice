import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Expense } from "@/entities/Expense";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { nextSequenceNumber } from "@/lib/numbering";
import { resolveProjectLink } from "@/controllers/projects/projectPayload";
import {
  calculateExpenseTotals,
  deriveExpenseStatus,
} from "@/utils/expenses/expenseCalculations";
import {
  readExpenseBody,
  assertCustomerInOrg,
  resolveCategoryId,
  parseDate,
  present,
  toBool,
} from "./expensePayload";

const createExpense = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;

  try {
    const { body, attachmentUrl } = await readExpenseBody(req);
    const db = await getDatabase();

    const expenseDate = parseDate(
      body.expenseDate ?? new Date().toISOString(),
      "Expense date",
    );
    const totals = calculateExpenseTotals(body.amount, body.taxPercent);
    if (totals.amount <= 0) throw new HttpError("Amount must be greater than 0", 400);

    let customerId = present(body.customerId) ? Number(body.customerId) : null;
    const link = await resolveProjectLink(db, orgId, {
      projectId: body.projectId,
      customerId,
    });
    if (link.project) customerId = link.project.customerId;
    if (customerId) await assertCustomerInOrg(db, customerId, orgId);
    const billable = toBool(body.billable);
    if (billable && !customerId) {
      throw new HttpError("A customer is required for billable expenses", 400);
    }
    const categoryId = (await resolveCategoryId(db, orgId, body)) ?? null;

    const repo = db.getRepository(Expense);
    const expense = repo.create({
      expenseNumber: await nextSequenceNumber(repo, "expenseNumber", orgId, "EXP"),
      expenseDate,
      vendor: String(body.vendor ?? "").trim() || undefined,
      customerId,
      projectId: link.projectId,
      categoryId,
      description: String(body.description ?? "").trim() || undefined,
      ...totals,
      currency: String(body.currency || "PKR"),
      paymentMethod: String(body.paymentMethod ?? "").trim() || undefined,
      referenceNumber: String(body.referenceNumber ?? "").trim() || undefined,
      billable,
      invoiced: false,
      invoiceId: null,
      notes: String(body.notes ?? "").trim() || undefined,
      attachment: attachmentUrl ?? null,
      status: deriveExpenseStatus(billable, false),
      userId,
      organizationId: orgId,
    } as Partial<Expense>);
    const saved = await repo.save(expense);

    const result = await repo.findOne({
      where: { id: saved.id },
      relations: ["customer", "category", "invoice", "projectRef"],
    });
    return NextResponse.json(
      { message: "Expense created successfully", expense: result },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Failed to create expense");
  }
};

export default createExpense;
