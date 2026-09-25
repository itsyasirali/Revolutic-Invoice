import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { Customer } from "@/entities/Customer";
import { Template } from "@/entities/Template";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { calculateInvoiceTotals } from "@/utils/invoices/invoiceCalculations";
import type { CreateInvoicePayload } from "@/types/invoice";

// Mirrors NotFoundException from the NestJS source (InvoicesCreateService),
// used so createInvoiceRecord's callers can map it to the right HTTP status.
export class InvoiceOperationError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "InvoiceOperationError";
    this.status = status;
  }
}

/**
 * Core invoice-creation logic (InvoicesCreateService.create), factored out
 * of the route-facing controller below so it can also be called from
 * sendInvoice.ts's 'draft' branch (mirrors the NestJS InvoicesController
 * calling `this.createService.create(...)` inline before sending).
 */
export const createInvoiceRecord = async (
  userId: number,
  payload: CreateInvoicePayload,
  orgId?: number | null,
): Promise<Invoice> => {
  const { customerId, templateId, items, ...invoiceData } = payload;

  const db = await getDatabase();
  const invoiceRepository = db.getRepository(Invoice);
  const customerRepository = db.getRepository(Customer);
  const templateRepository = db.getRepository(Template);

  if (!orgId) {
    throw new InvoiceOperationError(
      "Active organization is required to create an invoice",
      400,
    );
  }

  // Fetch customer and template concurrently
  const [customer, template] = await Promise.all([
    customerRepository.findOne({
      where: { id: customerId, organizationId: orgId },
    }),
    templateId
      ? templateRepository.findOne({
          where: { id: templateId, organizationId: orgId },
        })
      : templateRepository.findOne({
          where: { organizationId: orgId, isDefault: true },
        }),
  ]);

  if (!customer) {
    throw new InvoiceOperationError(
      `Customer with ID ${customerId} not found in this organization`,
      404,
    );
  }

  // Get template (provided or default)
  const finalTemplateId = template?.id;

  // Calculate next invoice number scoped to organization
  const lastInvoice = await invoiceRepository.findOne({
    where: { organizationId: orgId },
    order: { id: "DESC" },
  });
  let nextInvoiceSequence = 1;
  if (lastInvoice?.invoiceNumber) {
    const match = String(lastInvoice.invoiceNumber).match(/(\d+)\s*$/);
    const lastSequence = match ? parseInt(match[1], 10) : 0;
    nextInvoiceSequence = (Number.isNaN(lastSequence) ? 0 : lastSequence) + 1;
  }
  const invoiceNumber = `INV-${String(nextInvoiceSequence).padStart(4, "0")}`;

  // Calculate totals
  const calculatedData = calculateInvoiceTotals({
    ...invoiceData,
    items: items || [],
  });

  // Create invoice
  const invoice = invoiceRepository.create({
    ...invoiceData,
    ...calculatedData,
    invoiceNumber,
    invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : new Date(),
    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
    items:
      items?.map((item) => ({
        itemId: item.itemId || null, // Ensure itemId is handled
        title: item.title,
        description: item.description,
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0,
      })) || [],
    userId,
    organizationId: orgId,
    customerId,
    templateId: finalTemplateId || null,
    status: "Draft",
  } as unknown as Invoice);

  const savedInvoice = (await invoiceRepository.save(invoice)) as unknown as Invoice;

  // Fetch and return with relations
  const result = await invoiceRepository.findOne({
    where: { id: savedInvoice.id },
    relations: ["customer", "template", "items"],
  });

  if (!result) {
    throw new InvoiceOperationError("Invoice not found after creation", 404);
  }

  return result;
};

const createInvoice = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const orgId = await getAuthOrgId(req);
    const body: CreateInvoicePayload = await req.json();
    const parsedUserId = userId;

    const result = await createInvoiceRecord(parsedUserId, body, orgId);

    return NextResponse.json(
      { message: "Invoice created successfully", ...result },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof InvoiceOperationError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("Error creating invoice:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create invoice";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 },
    );
  }
};

export default createInvoice;
