import { NextRequest, NextResponse } from "next/server";
import { IsNull } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { InvoiceWriteOff } from "@/entities/InvoiceWriteOff";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const reverseWriteOff = async (
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
    if (isNaN(invoiceId)) {
      return NextResponse.json({ message: "Invalid invoice ID" }, { status: 400 });
    }

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);
    const writeOffRepository = db.getRepository(InvoiceWriteOff);

    const invoice = await invoiceRepository.findOne({
      where: { id: invoiceId, organizationId: orgId },
      relations: ["writeOffs"],
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found or access denied" },
        { status: 404 },
      );
    }

    const lastWriteOff = await writeOffRepository.findOne({
      where: { invoiceId, organizationId: orgId, reversedAt: IsNull() },
      order: { createdAt: "DESC" },
    });

    if (!lastWriteOff) {
      return NextResponse.json(
        { message: "This invoice has no active write-off to reverse" },
        { status: 400 },
      );
    }

    lastWriteOff.reversedAt = new Date();
    lastWriteOff.reversedByUserId = userId;
    await writeOffRepository.save(lastWriteOff);

    // Recompute remaining from total - received - remaining active
    // write-offs (excluding the one just reversed), rather than trusting
    // the persisted `remaining` column, for the same reason as writeOffInvoice.ts.
    const stillActiveWrittenOff = (invoice.writeOffs || []).reduce(
      (sum, w) =>
        sum + (w.reversedAt || w.id === lastWriteOff.id ? 0 : Number(w.amount || 0)),
      0,
    );
    const total = Number(invoice.total || 0);
    invoice.remaining = Math.max(
      0,
      Number((total - Number(invoice.received || 0) - stillActiveWrittenOff).toFixed(2)),
    );
    const received = Number(invoice.received || 0);
    if (received <= 0) {
      invoice.status = invoice.dueDate && new Date(invoice.dueDate) < new Date() ? "Overdue" : "Sent";
    } else if (received < total) {
      invoice.status = "Partially Paid";
    } else {
      invoice.status = "Paid";
    }
    await invoiceRepository.save(invoice);

    return NextResponse.json({
      message: "Write-off reversed successfully",
      invoice,
    });
  } catch (error: any) {
    console.error("Error reversing write-off:", error);
    return NextResponse.json(
      { message: "Failed to reverse write-off", error: error?.message || String(error) },
      { status: 500 },
    );
  }
};

export default reverseWriteOff;
