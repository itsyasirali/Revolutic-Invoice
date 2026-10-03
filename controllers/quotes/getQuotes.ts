import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Quote } from "@/entities/Quote";
import { getRequestContext, errorResponse } from "@/lib/requestContext";
import { QUOTE_RELATIONS, expireQuotes, loadQuote } from "./quotePayload";

export const getAllQuotes = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const db = await getDatabase();
    await expireQuotes(db, ctx.orgId);
    const quotes = await db.getRepository(Quote).find({
      where: { organizationId: ctx.orgId },
      relations: QUOTE_RELATIONS,
      order: { createdAt: "DESC", items: { sortOrder: "ASC" } },
    });
    return NextResponse.json({ quotes });
  } catch (error) {
    return errorResponse(error, "Failed to fetch quotes");
  }
};

export const getQuote = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  try {
    const db = await getDatabase();
    await expireQuotes(db, ctx.orgId);
    const quote = await loadQuote(db, parseInt(id), ctx.orgId);
    if (!quote) {
      return NextResponse.json({ message: "Quote not found" }, { status: 404 });
    }
    return NextResponse.json({ quote });
  } catch (error) {
    return errorResponse(error, "Failed to fetch quote");
  }
};
