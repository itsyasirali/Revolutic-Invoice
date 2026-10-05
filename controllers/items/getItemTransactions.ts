import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Item } from "@/entities/Item";
import { InvoiceItem } from "@/entities/InvoiceItem";
import { QuoteItem } from "@/entities/QuoteItem";
import { getRequestContext, errorResponse } from "@/lib/requestContext";

const LIMIT = 100;

/** Invoices and quotes that contain the item (Transactions tab of the item page). */
const getItemTransactions = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const itemId = Number((await params).id);
    if (!Number.isInteger(itemId)) {
      return NextResponse.json({ message: "Invalid item ID" }, { status: 400 });
    }

    const db = await getDatabase();
    const item = await db
      .getRepository(Item)
      .findOne({ where: { id: itemId, organizationId: ctx.orgId }, select: { id: true } });
    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    const [invoiceLines, quoteLines] = await Promise.all([
      db
        .getRepository(InvoiceItem)
        .createQueryBuilder("line")
        .innerJoin("line.invoice", "invoice")
        .innerJoin("invoice.customer", "customer")
        .select([
          "line.id",
          "line.quantity",
          "line.rate",
          "line.amount",
          "invoice.id",
          "invoice.invoiceNumber",
          "invoice.invoiceDate",
          "invoice.status",
          "invoice.currency",
          "customer.id",
          "customer.displayName",
        ])
        .where("line.itemId = :itemId", { itemId })
        .andWhere("invoice.organizationId = :orgId", { orgId: ctx.orgId })
        .orderBy("invoice.invoiceDate", "DESC")
        .limit(LIMIT)
        .getMany(),
      db
        .getRepository(QuoteItem)
        .createQueryBuilder("line")
        .innerJoin("line.quote", "quote")
        .innerJoin("quote.customer", "customer")
        .select([
          "line.id",
          "line.quantity",
          "line.rate",
          "line.amount",
          "quote.id",
          "quote.quoteNumber",
          "quote.quoteDate",
          "quote.status",
          "quote.currency",
          "customer.id",
          "customer.displayName",
        ])
        .where("line.itemId = :itemId", { itemId })
        .andWhere("quote.organizationId = :orgId", { orgId: ctx.orgId })
        .orderBy("quote.quoteDate", "DESC")
        .limit(LIMIT)
        .getMany(),
    ]);

    const transactions = [
      ...invoiceLines.map((l) => ({
        key: `invoice-${l.id}`,
        type: "Invoice" as const,
        id: l.invoice.id,
        number: l.invoice.invoiceNumber,
        date: l.invoice.invoiceDate,
        status: l.invoice.status,
        currency: l.invoice.currency,
        customer: l.invoice.customer?.displayName ?? "",
        quantity: Number(l.quantity),
        rate: Number(l.rate),
        amount: Number(l.amount),
      })),
      ...quoteLines.map((l) => ({
        key: `quote-${l.id}`,
        type: "Quote" as const,
        id: l.quote.id,
        number: l.quote.quoteNumber,
        date: l.quote.quoteDate,
        status: l.quote.status,
        currency: l.quote.currency,
        customer: l.quote.customer?.displayName ?? "",
        quantity: Number(l.quantity),
        rate: Number(l.rate),
        amount: Number(l.amount),
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ transactions });
  } catch (error) {
    return errorResponse(error, "Failed to fetch item transactions");
  }
};

export default getItemTransactions;
