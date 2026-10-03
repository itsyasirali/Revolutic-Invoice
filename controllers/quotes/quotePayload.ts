import type { DataSource } from "typeorm";
import { Customer } from "@/entities/Customer";
import { Template } from "@/entities/Template";
import { Quote } from "@/entities/Quote";
import { HttpError } from "@/lib/requestContext";
import { calculateQuoteTotals, type QuoteItemInput } from "@/utils/quotes/quoteCalculations";

export interface QuoteBody {
  customerId?: number | string;
  templateId?: number | string | null;
  quoteDate?: string;
  expiryDate?: string | null;
  currency?: string;
  referenceNumber?: string;
  items?: QuoteItemInput[];
  discountPercent?: number | string;
  shipping?: number | string;
  adjustment?: number | string;
  notes?: string;
  terms?: string;
}

export const QUOTE_RELATIONS = ["customer", "template", "items", "convertedInvoice"];

export const loadQuote = async (db: DataSource, id: number, orgId: number) =>
  db.getRepository(Quote).findOne({
    where: { id, organizationId: orgId },
    relations: QUOTE_RELATIONS,
    order: { items: { sortOrder: "ASC" } },
  });

/** Moves Sent/Viewed quotes past their expiry date to Expired (server-side). */
export const expireQuotes = async (db: DataSource, orgId: number) => {
  await db.query(
    `UPDATE "quotes" SET "status" = 'Expired'
     WHERE "organizationId" = $1 AND "status" IN ('Sent', 'Viewed')
       AND "expiryDate" IS NOT NULL AND "expiryDate" < NOW()`,
    [orgId],
  );
};

export const parseOptionalDate = (value: unknown): Date | null => {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(String(value));
  if (isNaN(d.getTime())) throw new HttpError("Invalid date", 400);
  return d;
};

export const validateCustomerAndTemplate = async (
  db: DataSource,
  orgId: number,
  customerId: unknown,
  templateId: unknown,
) => {
  const customer = await db
    .getRepository(Customer)
    .findOne({ where: { id: Number(customerId), organizationId: orgId } });
  if (!customer) throw new HttpError("Customer not found in this organization", 404);

  let finalTemplateId: number | null = null;
  if (templateId) {
    const template = await db
      .getRepository(Template)
      .findOne({ where: { id: Number(templateId), organizationId: orgId } });
    if (!template) throw new HttpError("Template not found in this organization", 404);
    finalTemplateId = template.id;
  } else {
    const def = await db
      .getRepository(Template)
      .findOne({ where: { organizationId: orgId, isDefault: true } });
    finalTemplateId = def?.id ?? null;
  }
  return { customer, templateId: finalTemplateId };
};

export const buildQuoteItems = (body: QuoteBody) => {
  const calc = calculateQuoteTotals(body);
  if (calc.items.length === 0) {
    throw new HttpError("Add at least one item to the quote", 400);
  }
  if (calc.items.some((i) => !i.name)) {
    throw new HttpError("Every quote item needs a name", 400);
  }
  if (calc.items.some((i) => i.quantity <= 0)) {
    throw new HttpError("Item quantity must be greater than 0", 400);
  }
  return calc;
};
