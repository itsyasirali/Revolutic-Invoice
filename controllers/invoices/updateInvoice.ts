import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { InvoiceItem } from "@/entities/InvoiceItem";
import { Customer } from "@/entities/Customer";
import { Template } from "@/entities/Template";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { calculateInvoiceTotals } from "@/utils/invoices/invoiceCalculations";
import type { UpdateInvoicePayload } from "@/types/invoice";

const updateInvoice = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const orgId = await getAuthOrgId(req);
  if (!orgId) {
    return NextResponse.json(
      { message: "Active organization is required" },
      { status: 400 },
    );
  }
  const { id } = await params;

  try {
    const invoiceId = Number(id);

    const body: UpdateInvoicePayload = await req.json();
    const { items, customerId, templateId, ...updateData } = body;

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);
    const invoiceItemRepository = db.getRepository(InvoiceItem);
    const customerRepository = db.getRepository(Customer);
    const templateRepository = db.getRepository(Template);

    // Find invoice
    const invoice = await invoiceRepository.findOne({
      where: { id: invoiceId, organizationId: orgId },
      relations: ["items"],
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found or access denied" },
        { status: 404 },
      );
    }

    // Verify customer if changing
    if (customerId) {
      const customer = await customerRepository.findOne({
        where: { id: customerId, organizationId: orgId },
      });

      if (!customer) {
        return NextResponse.json(
          { message: `Customer with ID ${customerId} not found in this organization` },
          { status: 404 },
        );
      }
    }

    // Verify template if changing
    if (templateId) {
      const template = await templateRepository.findOne({
        where: { id: templateId, organizationId: orgId },
      });

      if (!template) {
        return NextResponse.json(
          { message: `Template with ID ${templateId} not found in this organization` },
          { status: 404 },
        );
      }
    }

    // Calculate totals using existing item data if new items not provided, or new items if provided
    let calculatedData: Record<string, unknown> = {};
    if (items || Object.keys(updateData).length > 0) {
      calculatedData = calculateInvoiceTotals(
        {
          ...updateData,
          items: items || [],
        },
        invoice as unknown as Parameters<typeof calculateInvoiceTotals>[1],
      );
    }

    // Update invoice properties
    // We manually assign customerId and templateId to ensure they are updated if provided
    const finalDataset: Record<string, unknown> = {
      ...updateData,
      ...calculatedData,
    };
    // Remove items from dataset to prevent cascade saving effectively handling items twice or inefficiently
    if (finalDataset["items"]) {
      delete finalDataset["items"];
    }

    if (customerId) finalDataset["customerId"] = customerId;
    if (templateId !== undefined) finalDataset["templateId"] = templateId || null; // Also align templateId
    if (finalDataset["invoiceDate"])
      finalDataset["invoiceDate"] = new Date(finalDataset["invoiceDate"] as string);
    if (finalDataset["dueDate"])
      finalDataset["dueDate"] = new Date(finalDataset["dueDate"] as string);

    Object.assign(invoice, finalDataset);

    const savedInvoice = await invoiceRepository.save(invoice);

    // Update items if provided
    if (items) {
      // Delete existing items
      await invoiceItemRepository.delete({ invoiceId: savedInvoice.id });

      // Create new items
      if (items.length > 0) {
        const invoiceItems = items.map((item) => {
          const { itemId, ...itemData } = item;
          return invoiceItemRepository.create({
            ...itemData,
            itemId: itemId || null,
            invoiceId: savedInvoice.id,
          });
        });
        await invoiceItemRepository.save(invoiceItems);
      }
    }

    // Fetch and return with relations
    const result = await invoiceRepository.findOne({
      where: { id: savedInvoice.id },
      relations: ["customer", "template", "items"],
    });

    if (!result) {
      return NextResponse.json(
        { message: "Invoice not found after update" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Invoice updated successfully", ...result });
  } catch (error) {
    console.error("Error updating invoice:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update invoice";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 },
    );
  }
};

export default updateInvoice;
