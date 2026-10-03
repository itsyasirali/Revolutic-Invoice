import { NextRequest, NextResponse } from "next/server";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { deleteExpensesByIds } from "./deleteExpense";

const batchDeleteExpenses = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { expenses } = (await req.json()) as { expenses?: (string | number)[] };
    const ids = (Array.isArray(expenses) ? expenses : [])
      .map((v) => parseInt(String(v)))
      .filter((v) => !isNaN(v));
    if (ids.length === 0) throw new HttpError("No expenses provided", 400);
    const deleted = await deleteExpensesByIds(ctx.orgId, ids);
    return NextResponse.json({ message: "Expenses deleted successfully", deleted });
  } catch (error) {
    return errorResponse(error, "Failed to delete expenses");
  }
};

export default batchDeleteExpenses;
