import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { ExpenseCategory } from "@/entities/ExpenseCategory";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";

export const listExpenseCategories = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const db = await getDatabase();
    const categories = await db.getRepository(ExpenseCategory).find({
      where: { organizationId: ctx.orgId },
      order: { name: "ASC" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return errorResponse(error, "Failed to fetch categories");
  }
};

export const createExpenseCategory = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  try {
    const { name } = (await req.json()) as { name?: string };
    const trimmed = String(name ?? "").trim();
    if (!trimmed) throw new HttpError("Category name is required", 400);
    const db = await getDatabase();
    const repo = db.getRepository(ExpenseCategory);
    const existing = await repo
      .createQueryBuilder("c")
      .where("c.organizationId = :orgId AND LOWER(c.name) = LOWER(:name)", {
        orgId: ctx.orgId,
        name: trimmed,
      })
      .getOne();
    if (existing) return NextResponse.json({ category: existing });
    const category = await repo.save(
      repo.create({ name: trimmed, organizationId: ctx.orgId }),
    );
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to create category");
  }
};
