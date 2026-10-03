import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Expense } from "@/entities/Expense";
import { getRequestContext, errorResponse } from "@/lib/requestContext";

const getAllExpenses = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const db = await getDatabase();
    const expenses = await db.getRepository(Expense).find({
      where: { organizationId: ctx.orgId },
      relations: ["customer", "category", "invoice", "projectRef"],
      order: { expenseDate: "DESC", id: "DESC" },
    });
    return NextResponse.json({ expenses });
  } catch (error) {
    return errorResponse(error, "Failed to fetch expenses");
  }
};

export default getAllExpenses;
