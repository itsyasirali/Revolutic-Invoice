import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { InvoiceItem } from "@/entities/InvoiceItem";
import { Customer } from "@/entities/Customer";
import { readSession } from "@/lib/session";
import { calculateInvoiceTotals } from "@/utils/invoices/invoiceCalculations";
import type { UpdateInvoicePayload } from "@/types/invoice";

const updateInvoice = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;
  const { id } = await params;

  try {
    const parsedUserId = parseInt(String(userId));
    const invoiceId = Number(id);

    const body: UpdateInvoicePayload = await req.json();
    const { items, customerId, templateId, ...updateData } = body;

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);
    const invoiceItemRepository = db.getRepository(InvoiceItem);
    const customerRepository = db.getRepository(Customer);

    // Find invoice
    const invoice = await invoiceRepository.findOne({
      where: { id: invoiceId, userId: parsedUserId },
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
        where: { id: customerId, userId: parsedUserId },
      });

      if (!customer) {
        return NextResponse.json(
          { message: `Customer with ID ${customerId} not found for this user` },
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
    return NextResponse.json(
      { message: "Failed to update invoice" },
      { status: 500 },
    );
  }
};

export default updateInvoice;
