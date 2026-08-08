import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { Customer } from "@/entities/Customer";
import { Template } from "@/entities/Template";
import { readSession } from "@/lib/session";
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
): Promise<Invoice> => {
  const { customerId, templateId, items, ...invoiceData } = payload;

  const db = await getDatabase();
  const invoiceRepository = db.getRepository(Invoice);
  const customerRepository = db.getRepository(Customer);
  const templateRepository = db.getRepository(Template);

  // Verify customer exists and belongs to user
  const customer = await customerRepository.findOne({
    where: { id: customerId, userId },
  });

  if (!customer) {
    throw new InvoiceOperationError(
      `Customer with ID ${customerId} not found for this user`,
      404,
    );
  }

  // Get template (provided or default)
  let finalTemplateId = templateId;
  if (!finalTemplateId) {
    const defaultTemplate = await templateRepository.findOne({
      where: { userId, isDefault: true },
    });
    if (defaultTemplate) {
      finalTemplateId = defaultTemplate.id;
    }
  }

  // Calculate totals
  const calculatedData = calculateInvoiceTotals({
    ...invoiceData,
    items: items || [],
  });

  // Create invoice
  const invoice = invoiceRepository.create({
    ...invoiceData,
    ...calculatedData,
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
    customerId,
    templateId: finalTemplateId || null,
    status: "Draft",
  } as Partial<Invoice>);

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
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const body: CreateInvoicePayload = await req.json();
    const parsedUserId = parseInt(String(userId));

    const result = await createInvoiceRecord(parsedUserId, body);

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
    return NextResponse.json(
      { message: "Failed to create invoice" },
      { status: 500 },
    );
  }
};

export default createInvoice;
