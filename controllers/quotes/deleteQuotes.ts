import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Quote } from "@/entities/Quote";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { parseIds } from "@/lib/services/billingService";

const deleteQuotesByIds = async (orgId: number, ids: number[]) => {
  const db = await getDatabase();
  const repo = db.getRepository(Quote);
  const converted = await repo.count({
    where: { id: In(ids), organizationId: orgId, status: "Converted" },
  });
  if (converted > 0) {
    throw new HttpError(
      "Converted quotes cannot be deleted because an invoice was created from them.",
      409,
    );
  }
  const result = await repo.delete({ id: In(ids), organizationId: orgId });
  return result.affected ?? 0;
};

export const deleteQuote = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  try {
    const affected = await deleteQuotesByIds(ctx.orgId, [parseInt(id)]);
    if (!affected) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Quote deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete quote");
  }
};

export const batchDeleteQuotes = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const { quotes } = (await req.json()) as { quotes?: unknown };
    const ids = parseIds(quotes);
    if (ids.length === 0) throw new HttpError("No quotes provided", 400);
    const deleted = await deleteQuotesByIds(ctx.orgId, ids);
    return NextResponse.json({ message: "Quotes deleted successfully", deleted });
  } catch (error) {
    return errorResponse(error, "Failed to delete quotes");
  }
};
