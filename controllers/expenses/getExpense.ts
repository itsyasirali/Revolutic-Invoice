import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Expense } from "@/entities/Expense";
import { getRequestContext, errorResponse } from "@/lib/requestContext";

const getExpense = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  try {
    const db = await getDatabase();
    const expense = await db.getRepository(Expense).findOne({
      where: { id: parseInt(id), organizationId: ctx.orgId },
      relations: ["customer", "category", "invoice", "projectRef"],
    });
    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json({ expense });
  } catch (error) {
    return errorResponse(error, "Failed to fetch expense");
  }
};

export default getExpense;
