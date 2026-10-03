import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Quote } from "@/entities/Quote";
import { QuoteItem } from "@/entities/QuoteItem";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { nextSequenceNumber } from "@/lib/numbering";
import {
  QuoteBody,
  buildQuoteItems,
  loadQuote,
  parseOptionalDate,
  validateCustomerAndTemplate,
} from "./quotePayload";

const createQuote = async (req: NextRequest) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;

  try {
    const body = (await req.json()) as QuoteBody;
    const db = await getDatabase();

    const { templateId } = await validateCustomerAndTemplate(
      db,
      orgId,
      body.customerId,
      body.templateId,
    );
    const calc = buildQuoteItems(body);
    const quoteDate = parseOptionalDate(body.quoteDate) ?? new Date();
    const expiryDate = parseOptionalDate(body.expiryDate);
    if (expiryDate && expiryDate < new Date(quoteDate.toDateString())) {
      throw new HttpError("Expiry date cannot be before the quote date", 400);
    }

    const repo = db.getRepository(Quote);
    const { items, ...totals } = calc;
    const quote = repo.create({
      quoteNumber: await nextSequenceNumber(repo, "quoteNumber", orgId, "QUO"),
      customerId: Number(body.customerId),
      templateId,
      quoteDate,
      expiryDate: expiryDate ?? undefined,
      currency: String(body.currency || "PKR"),
      referenceNumber: String(body.referenceNumber ?? "").trim() || undefined,
      notes: String(body.notes ?? "").trim() || undefined,
      terms: String(body.terms ?? "").trim() || undefined,
      ...totals,
      status: "Draft",
      userId,
      organizationId: orgId,
      items: items.map((i) => Object.assign(new QuoteItem(), i)),
    } as unknown as Quote);
    const saved = await repo.save(quote);

    const result = await loadQuote(db, saved.id, orgId);
    return NextResponse.json(
      { message: "Quote created successfully", quote: result },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Failed to create quote");
  }
};

export default createQuote;
