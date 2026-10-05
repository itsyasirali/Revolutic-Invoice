import { NextRequest, NextResponse } from "next/server";
import { quoteEditable } from "@/lib/editLock";
import { getDatabase } from "@/lib/database";
import { Quote } from "@/entities/Quote";
import { QuoteItem } from "@/entities/QuoteItem";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import {
  QuoteBody,
  buildQuoteItems,
  loadQuote,
  parseOptionalDate,
  validateCustomerAndTemplate,
} from "./quotePayload";


const updateQuote = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { orgId } = ctx;
  const { id } = await params;

  try {
    const db = await getDatabase();
    const quoteRepo = db.getRepository(Quote);
    const existing = await loadQuote(db, parseInt(id), orgId);
    if (!existing) throw new HttpError("Quote not found", 404);
    if (!quoteEditable(existing.status)) {
      throw new HttpError(`A ${existing.status} quote can no longer be edited`, 409);
    }

    const body = (await req.json()) as QuoteBody;
    const { templateId } = await validateCustomerAndTemplate(
      db,
      orgId,
      body.customerId ?? existing.customerId,
      body.templateId === undefined ? existing.templateId : body.templateId,
    );
    const calc = buildQuoteItems({
      discountPercent: existing.discountPercent,
      shipping: existing.shipping,
      adjustment: existing.adjustment,
      ...body,
      items:
        body.items ??
        existing.items.map((i) => ({
          itemId: i.itemId,
          name: i.name,
          description: i.description,
          quantity: i.quantity,
          rate: i.rate,
          discount: i.discount,
          tax: i.tax,
        })),
    });

    const quoteDate = body.quoteDate ? parseOptionalDate(body.quoteDate)! : existing.quoteDate;
    const expiryDate =
      body.expiryDate === undefined ? existing.expiryDate : parseOptionalDate(body.expiryDate);
    if (expiryDate && expiryDate < new Date(new Date(quoteDate).toDateString())) {
      throw new HttpError("Expiry date cannot be before the quote date", 400);
    }

    const { items, ...totals } = calc;
    await db.transaction(async (manager) => {
      await manager.getRepository(QuoteItem).delete({ quoteId: existing.id });
      await manager.getRepository(Quote).update(
        { id: existing.id, organizationId: orgId },
        {
          customerId: Number(body.customerId ?? existing.customerId),
          templateId,
          quoteDate,
          expiryDate: expiryDate ?? (null as unknown as Date),
          currency: body.currency ? String(body.currency) : existing.currency,
          referenceNumber:
            body.referenceNumber !== undefined
              ? String(body.referenceNumber).trim()
              : existing.referenceNumber,
          notes: body.notes !== undefined ? String(body.notes).trim() : existing.notes,
          terms: body.terms !== undefined ? String(body.terms).trim() : existing.terms,
          ...totals,
        },
      );
      await manager.getRepository(QuoteItem).save(
        items.map((i) => Object.assign(new QuoteItem(), i, { quoteId: existing.id })),
      );
    });
    void quoteRepo;

    const result = await loadQuote(db, existing.id, orgId);
    return NextResponse.json({ message: "Quote updated successfully", quote: result });
  } catch (error) {
    return errorResponse(error, "Failed to update quote");
  }
};

export default updateQuote;
