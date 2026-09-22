import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { InvoiceWriteOff } from "@/entities/InvoiceWriteOff";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const NON_WRITE_OFF_ELIGIBLE = ["draft", "paid", "cancelled", "written off"];

const writeOffInvoice = async (
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

    const body = await req.json();
    const reason = String(body?.reason ?? "").trim();
    const requestedAmount = Number(body?.amount);

    if (!reason) {
      return NextResponse.json(
        { message: "A reason is required to write off an invoice" },
        { status: 400 },
      );
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

    const status = String(invoice.status ?? "").toLowerCase();
    if (NON_WRITE_OFF_ELIGIBLE.includes(status)) {
      return NextResponse.json(
        { message: `Invoices with status "${invoice.status}" cannot be written off` },
        { status: 400 },
      );
    }

    // Derive the true remaining balance from total - received - existing
    // (unreversed) write-offs, rather than trusting the persisted
    // `remaining` column alone, which isn't always kept in sync (e.g. a
    // freshly created, never-paid invoice may still have it at its 0
    // default). This also correctly accounts for any prior write-offs.
    const existingWrittenOff = (invoice.writeOffs || []).reduce(
      (sum, w) => sum + (w.reversedAt ? 0 : Number(w.amount || 0)),
      0,
    );
    const remaining = Math.max(
      0,
      Number((Number(invoice.total || 0) - Number(invoice.received || 0) - existingWrittenOff).toFixed(2)),
    );
    const amount = Number.isFinite(requestedAmount) && requestedAmount > 0
      ? requestedAmount
      : remaining;

    if (amount <= 0 || amount > remaining) {
      return NextResponse.json(
        { message: `Write-off amount must be greater than 0 and at most the remaining balance (${remaining})` },
        { status: 400 },
      );
    }

    const writeOff = writeOffRepository.create({
      invoiceId: invoice.id,
      organizationId: orgId,
      userId,
      amount,
      reason,
      writeOffDate: new Date(),
    });
    await writeOffRepository.save(writeOff);

    invoice.remaining = Number((remaining - amount).toFixed(2));
    if (invoice.remaining <= 0) {
      invoice.status = "Written Off";
    }
    await invoiceRepository.save(invoice);

    return NextResponse.json({
      message: "Invoice written off successfully",
      invoice,
      writeOff,
    });
  } catch (error: any) {
    console.error("Error writing off invoice:", error);
    return NextResponse.json(
      { message: "Failed to write off invoice", error: error?.message || String(error) },
      { status: 500 },
    );
  }
};

export default writeOffInvoice;
