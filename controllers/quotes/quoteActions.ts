import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Quote } from "@/entities/Quote";
import { QuoteItem } from "@/entities/QuoteItem";
import { getRequestContext, errorResponse, HttpError } from "@/lib/requestContext";
import { nextSequenceNumber } from "@/lib/numbering";
import { createInvoiceRecord } from "@/controllers/invoices/createInvoice";
import {
  quoteToInvoiceLines,
  quoteNotesWithTerms,
} from "@/utils/quotes/quoteInvoiceAdapter";
import { queryRows } from "@/lib/services/sqlRows";
import { expireQuotes, loadQuote } from "./quotePayload";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Atomic status transition: only succeeds when the quote is currently in one
 * of `from`, so concurrent or repeated requests cannot double-apply.
 */
const transition = async (
  req: NextRequest,
  { params }: Ctx,
  from: string[],
  to: string,
  label: string,
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { id } = await params;

  try {
    const db = await getDatabase();
    await expireQuotes(db, ctx.orgId);
    const rows = await queryRows(
      db,
      `UPDATE "quotes" SET "status" = $1, "updatedAt" = NOW()
       WHERE "id" = $2 AND "organizationId" = $3 AND "status" = ANY($4::text[])
       RETURNING "id"`,
      [to, parseInt(id), ctx.orgId, from],
    );
    if (rows.length === 0) {
      const quote = await loadQuote(db, parseInt(id), ctx.orgId);
      if (!quote) throw new HttpError("Quote not found", 404);
      throw new HttpError(`A ${quote.status} quote cannot be ${label}`, 409);
    }
    const quote = await loadQuote(db, parseInt(id), ctx.orgId);
    return NextResponse.json({ message: `Quote ${label}`, quote });
  } catch (error) {
    return errorResponse(error, `Failed to mark quote ${label}`);
  }
};

export const acceptQuote = (req: NextRequest, c: Ctx) =>
  transition(req, c, ["Sent", "Viewed"], "Accepted", "accepted");

export const declineQuote = (req: NextRequest, c: Ctx) =>
  transition(req, c, ["Sent", "Viewed"], "Declined", "declined");

export const markQuoteViewed = (req: NextRequest, c: Ctx) =>
  transition(req, c, ["Sent"], "Viewed", "marked as viewed");

export const cloneQuote = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;
  const { id } = await params;

  try {
    const db = await getDatabase();
    const source = await loadQuote(db, parseInt(id), orgId);
    if (!source) throw new HttpError("Quote not found", 404);

    const repo = db.getRepository(Quote);
    const clone = repo.create({
      quoteNumber: await nextSequenceNumber(repo, "quoteNumber", orgId, "QUO"),
      customerId: source.customerId,
      templateId: source.templateId,
      quoteDate: new Date(),
      expiryDate: undefined,
      currency: source.currency,
      referenceNumber: source.referenceNumber,
      subTotal: source.subTotal,
      discountPercent: source.discountPercent,
      discount: source.discount,
      tax: source.tax,
      shipping: source.shipping,
      adjustment: source.adjustment,
      total: source.total,
      notes: source.notes,
      terms: source.terms,
      status: "Draft",
      convertedInvoiceId: null,
      userId,
      organizationId: orgId,
      items: source.items.map((i) =>
        Object.assign(new QuoteItem(), {
          itemId: i.itemId,
          name: i.name,
          description: i.description,
          quantity: i.quantity,
          rate: i.rate,
          discount: i.discount,
          tax: i.tax,
          amount: i.amount,
          sortOrder: i.sortOrder,
        }),
      ),
    } as unknown as Quote);
    const saved = await repo.save(clone);
    return NextResponse.json(
      { message: "Quote cloned", quote: await loadQuote(db, saved.id, orgId) },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Failed to clone quote");
  }
};

/**
 * Quote -> Invoice (Draft). The quote is claimed atomically (Accepted ->
 * Converted, no invoice yet) so it can only ever be converted once.
 */
export const convertQuote = async (req: NextRequest, { params }: Ctx) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;
  const { userId, orgId } = ctx;
  const { id } = await params;
  const quoteId = parseInt(id);

  try {
    const db = await getDatabase();
    const claimed = await queryRows(
      db,
      `UPDATE "quotes" SET "status" = 'Converted'
       WHERE "id" = $1 AND "organizationId" = $2
         AND "status" = 'Accepted' AND "convertedInvoiceId" IS NULL
       RETURNING "id"`,
      [quoteId, orgId],
    );
    if (claimed.length === 0) {
      const quote = await loadQuote(db, quoteId, orgId);
      if (!quote) throw new HttpError("Quote not found", 404);
      if (quote.status === "Converted" || quote.convertedInvoiceId) {
        throw new HttpError("This quote has already been converted to an invoice", 409);
      }
      throw new HttpError("Only an accepted quote can be converted to an invoice", 409);
    }

    try {
      const quote = await loadQuote(db, quoteId, orgId);
      if (!quote) throw new HttpError("Quote not found", 404);

      const invoice = await createInvoiceRecord(
        userId,
        {
          customerId: quote.customerId,
          templateId: quote.templateId ?? undefined,
          invoiceNumber: "",
          invoiceDate: new Date().toISOString(),
          currency: quote.currency,
          discountPercent: Number(quote.discountPercent),
          notes: quoteNotesWithTerms(quote) || undefined,
          items: quoteToInvoiceLines(quote),
        } as unknown as Parameters<typeof createInvoiceRecord>[1],
        orgId,
        { quoteId },
      );

      await db.query(`UPDATE "quotes" SET "convertedInvoiceId" = $1 WHERE "id" = $2`, [
        invoice.id,
        quoteId,
      ]);
      return NextResponse.json(
        {
          message: "Quote converted to invoice",
          invoice,
          quote: await loadQuote(db, quoteId, orgId),
        },
        { status: 201 },
      );
    } catch (inner) {
      await db.query(
        `UPDATE "quotes" SET "status" = 'Accepted', "convertedInvoiceId" = NULL WHERE "id" = $1`,
        [quoteId],
      );
      throw inner;
    }
  } catch (error) {
    return errorResponse(error, "Failed to convert quote");
  }
};
