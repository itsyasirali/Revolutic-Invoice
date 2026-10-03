import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Expense } from "@/entities/Expense";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";

/** Shared by DELETE /expenses/[id] and POST /expenses/batch-delete. */
export const deleteExpensesByIds = async (orgId: number, ids: number[]) => {
  const db = await getDatabase();
  const repo = db.getRepository(Expense);
  const invoicedCount = await repo.count({
    where: { id: In(ids), organizationId: orgId, invoiced: true },
  });
  if (invoicedCount > 0) {
    throw new HttpError(
      "Invoiced expenses cannot be deleted. Delete the invoice first.",
      409,
    );
  }
  const result = await repo.delete({ id: In(ids), organizationId: orgId });
  return result.affected ?? 0;
};

const deleteExpense = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  try {
    const affected = await deleteExpensesByIds(ctx.orgId, [parseInt(id)]);
    if (!affected) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete expense");
  }
};

export default deleteExpense;
