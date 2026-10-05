import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { PaymentAppliedInvoice } from "@/entities/PaymentAppliedInvoice";
import { Invoice } from "@/entities/Invoice";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

/** Validation failure carrying the HTTP status to answer with. */
class UpdateError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const round2 = (n: number) => Number(n.toFixed(2));

/**
 * Recomputes an invoice's paid/remaining amounts and status after payments
 * were applied or removed (same rules as when a payment is created).
 */
const refreshInvoice = (invoice: Invoice) => {
  const writtenOff = (invoice.writeOffs || []).reduce(
    (sum, w) => sum + (w.reversedAt ? 0 : Number(w.amount || 0)),
    0,
  );
  const received = Math.max(0, round2(Number(invoice.received) || 0));
  const total = Number(invoice.total) || 0;
  const remaining = Math.max(0, round2(total - received - writtenOff));
  invoice.received = received;
  invoice.remaining = remaining;

  if (remaining <= 0) {
    invoice.status = "Paid";
  } else if (received > 0) {
    invoice.status = "Partially Paid";
  } else if (["Paid", "Partially Paid"].includes(invoice.status)) {
    // Payments were taken back: the invoice is open again.
    const overdue = invoice.dueDate && new Date(invoice.dueDate) < new Date();
    invoice.status = overdue ? "Overdue" : "Sent";
  }
};

const updatePayment = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { message: "Invalid payment ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const orgId = await getAuthOrgId(req);
    if (!orgId) {
      return NextResponse.json(
        { message: "Active organization is required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    await db.transaction(async (m) => {
      const paymentRepo = m.getRepository(Payment);
      const appliedRepo = m.getRepository(PaymentAppliedInvoice);
      const invoiceRepo = m.getRepository(Invoice);

      const payment = await paymentRepo.findOne({
        where: { id: paymentId, organizationId: orgId },
        relations: ["appliedInvoices"],
      });
      if (!payment) throw new UpdateError("Payment not found", 404);

      if (body.templateId !== undefined) payment.templateId = Number(body.templateId);
      if (body.status !== undefined) payment.status = body.status;
      if (body.paymentMode !== undefined) payment.paymentMode = body.paymentMode;
      if (body.referenceNo !== undefined) payment.referenceNo = body.referenceNo;
      if (body.notes !== undefined) payment.notes = body.notes;
      if (body.paymentDate) payment.paymentDate = new Date(body.paymentDate);
      if (body.bankCharges !== undefined) {
        const charges = Number(body.bankCharges) || 0;
        if (charges < 0) throw new UpdateError("Bank charges must not be negative");
        payment.bankCharges = charges;
      }

      const oldApplied = payment.appliedInvoices || [];
      const replaceApplied = Array.isArray(body.appliedInvoices);

      let newAmount = Number(payment.amountReceived);
      if (body.amountReceived !== undefined) {
        newAmount = Number(body.amountReceived);
        if (!Number.isFinite(newAmount) || newAmount < 0) {
          throw new UpdateError("Amount received must be a valid non-negative number");
        }
      }

      if (!replaceApplied) {
        // Callers that only change the amount (no invoice list): it must still match
        // what is applied, since the invoices were settled with those amounts.
        const totalApplied = oldApplied.reduce((sum, a) => sum + Number(a.amount || 0), 0);
        if (
          body.amountReceived !== undefined &&
          totalApplied > 0 &&
          round2(newAmount - totalApplied) !== 0
        ) {
          throw new UpdateError(
            `Amount received must equal the total applied to invoices (${totalApplied.toFixed(2)})`,
          );
        }
      } else {
        // Re-apply: take the old amounts back from their invoices, then apply the new ones.
        const next: { invoiceId: number; amount: number }[] = [];
        const seen = new Set<number>();
        for (const row of body.appliedInvoices as { invoiceId: unknown; amount: unknown }[]) {
          const invoiceId = Number(row.invoiceId);
          const amount = Number(row.amount) || 0;
          if (!invoiceId || amount <= 0) continue;
          if (seen.has(invoiceId) || amount < 0) {
            throw new UpdateError("Invalid applied invoice amounts");
          }
          seen.add(invoiceId);
          next.push({ invoiceId, amount });
        }

        const totalApplied = round2(next.reduce((sum, a) => sum + a.amount, 0));
        if (totalApplied > newAmount) {
          throw new UpdateError(
            `Total applied amount (${totalApplied.toFixed(2)}) exceeds the payment amount received (${newAmount.toFixed(2)})`,
          );
        }
        if (payment.status !== "Draft" && totalApplied > 0 && round2(newAmount - totalApplied) > 0) {
          throw new UpdateError(
            `Amount received (${newAmount.toFixed(2)}) exceeds the total applied to invoices (${totalApplied.toFixed(2)})`,
          );
        }

        const ids = Array.from(new Set([...oldApplied.map((a) => a.invoiceId), ...next.map((a) => a.invoiceId)]));
        const invoices = ids.length
          ? await invoiceRepo.find({
              where: { id: In(ids), organizationId: orgId },
              relations: ["writeOffs"],
            })
          : [];
        const byId = new Map(invoices.map((inv) => [inv.id, inv]));

        for (const old of oldApplied) {
          const inv = byId.get(old.invoiceId);
          if (inv) inv.received = Number(inv.received || 0) - Number(old.amount || 0);
        }
        for (const row of next) {
          const inv = byId.get(row.invoiceId);
          if (!inv) throw new UpdateError(`Invoice with ID ${row.invoiceId} not found in this organization`, 404);
          // Balance available for this payment: what is still open once the old amount is taken back.
          const writtenOff = (inv.writeOffs || []).reduce(
            (sum, w) => sum + (w.reversedAt ? 0 : Number(w.amount || 0)),
            0,
          );
          const open = round2(Number(inv.total) - Math.max(0, Number(inv.received || 0)) - writtenOff);
          if (row.amount > open + 0.001) {
            throw new UpdateError(
              `Payment amount exceeds invoice ${inv.invoiceNumber}'s remaining balance of ${Math.max(0, open).toFixed(2)}`,
            );
          }
          inv.received = Number(inv.received || 0) + row.amount;
        }

        for (const inv of invoices) {
          refreshInvoice(inv);
          await invoiceRepo.update(inv.id, {
            received: inv.received,
            remaining: inv.remaining,
            status: inv.status,
          });
        }

        if (oldApplied.length) await appliedRepo.delete(oldApplied.map((a) => a.id));
        for (const row of next) {
          await appliedRepo.save(
            appliedRepo.create({ paymentId: payment.id, invoiceId: row.invoiceId, amount: row.amount }),
          );
        }
        // The rows were replaced above. Leave the (now stale) relation out of save(),
        // otherwise TypeORM tries to detach rows that no longer exist.
        delete (payment as Partial<Payment>).appliedInvoices;
      }

      payment.amountReceived = newAmount;
      await paymentRepo.save(payment);
    });

    const updatedPayment = await db.getRepository(Payment).findOne({
      where: { id: paymentId },
      relations: ["customer", "template", "appliedInvoices", "appliedInvoices.invoice"],
    });

    return NextResponse.json({ payment: updatedPayment });
  } catch (error) {
    if (error instanceof UpdateError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { message: "Failed to update payment" },
      { status: 500 }
    );
  }
};

export default updatePayment;
