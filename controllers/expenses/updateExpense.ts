import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Expense } from "@/entities/Expense";
import { resolveProjectLink } from "@/controllers/projects/projectPayload";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
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

const updateExpense = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { orgId } = ctx;
  const { id } = await params;

  try {
    const db = await getDatabase();
    const repo = db.getRepository(Expense);
    const expense = await repo.findOne({
      where: { id: parseInt(id), organizationId: orgId },
    });
    if (!expense) throw new HttpError("Expense not found", 404);
    if (expense.invoiced) {
      throw new HttpError("An invoiced expense can no longer be edited", 409);
    }

    const { body, attachmentUrl } = await readExpenseBody(req);

    if (body.expenseDate !== undefined) {
      expense.expenseDate = parseDate(body.expenseDate, "Expense date");
    }
    if (body.vendor !== undefined) expense.vendor = String(body.vendor).trim();
    if (body.description !== undefined) expense.description = String(body.description).trim();
    if (body.notes !== undefined) expense.notes = String(body.notes).trim();
    if (body.referenceNumber !== undefined) {
      expense.referenceNumber = String(body.referenceNumber).trim();
    }
    if (body.paymentMethod !== undefined) {
      expense.paymentMethod = String(body.paymentMethod).trim();
    }
    if (body.currency) expense.currency = String(body.currency);

    if (body.amount !== undefined || body.taxPercent !== undefined) {
      const totals = calculateExpenseTotals(
        body.amount ?? expense.amount,
        body.taxPercent ?? expense.taxPercent,
      );
      if (totals.amount <= 0) throw new HttpError("Amount must be greater than 0", 400);
      Object.assign(expense, totals);
    }

    if (body.customerId !== undefined) {
      const customerId = present(body.customerId) ? Number(body.customerId) : null;
      if (customerId) await assertCustomerInOrg(db, customerId, orgId);
      expense.customerId = customerId;
    }
    if (body.projectId !== undefined) {
      const link = await resolveProjectLink(db, orgId, {
        projectId: body.projectId,
        customerId: expense.customerId,
      });
      expense.projectId = link.projectId;
      if (link.project) expense.customerId = link.project.customerId;
    }
    if (body.billable !== undefined) expense.billable = toBool(body.billable);
    if (expense.billable && !expense.customerId) {
      throw new HttpError("A customer is required for billable expenses", 400);
    }

    const categoryId = await resolveCategoryId(db, orgId, body);
    if (categoryId !== undefined) expense.categoryId = categoryId;

    if (attachmentUrl) expense.attachment = attachmentUrl;
    else if (toBool(body.removeAttachment)) expense.attachment = null;

    expense.status = deriveExpenseStatus(expense.billable, expense.invoiced);
    await repo.save(expense);

    const result = await repo.findOne({
      where: { id: expense.id },
      relations: ["customer", "category", "invoice", "projectRef"],
    });
    return NextResponse.json({ message: "Expense updated successfully", expense: result });
  } catch (error) {
    return errorResponse(error, "Failed to update expense");
  }
};

export default updateExpense;
