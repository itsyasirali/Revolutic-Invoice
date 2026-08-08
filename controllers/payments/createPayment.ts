import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Payment } from "@/entities/Payment";
import { PaymentAppliedInvoice } from "@/entities/PaymentAppliedInvoice";
import { Invoice } from "@/entities/Invoice";
import { Customer } from "@/entities/Customer";
import { readSession } from "@/lib/session";

const createPayment = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const parsedUserId = parseInt(String(userId));
    const body = await req.json();

    const db = await getDatabase();
    const paymentRepo = db.getRepository(Payment);
    const appliedRepo = db.getRepository(PaymentAppliedInvoice);
    const invoiceRepo = db.getRepository(Invoice);
    const customerRepo = db.getRepository(Customer);

    // Calculate payment number
    const lastPayment = await paymentRepo.findOne({
      where: { userId: parsedUserId },
      order: { paymentNumber: "DESC" },
    });
    const nextPaymentNumber = (lastPayment?.paymentNumber || 0) + 1;

    const customerId = Number(body.customerId);
    const customer = await customerRepo.findOne({
      where: { id: customerId, userId: parsedUserId },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 400 }
      );
    }

    const newPayment = paymentRepo.create({
      paymentDate: new Date(body.paymentDate || Date.now()),
      paymentNumber: nextPaymentNumber,
      referenceNo: body.referenceNo || null,
      userId: parsedUserId,
      customerId,
      customerDisplayName:
        body.customerDisplayName || customer.displayName || customer.companyName,
      customerEmail: body.customerEmail || customer.contacts?.[0]?.email || null,
      paymentMode: body.paymentMode || "Cash",
      status: body.status || "Paid",
      amountReceived: Number(body.amountReceived) || 0,
      bankCharges: Number(body.bankCharges) || 0,
      currency: body.currency || "PKR",
      notes: body.notes || null,
      templateId: body.templateId ? Number(body.templateId) : undefined,
    } as unknown as Payment);

    const savedPayment = await paymentRepo.save(newPayment);

    // Handle applied invoices
    if (body.appliedInvoices && Array.isArray(body.appliedInvoices)) {
      for (const item of body.appliedInvoices) {
        const invId = Number(item.invoiceId);
        const amountApplied = Number(item.amount) || 0;

        if (invId && amountApplied > 0) {
          const appliedRecord = appliedRepo.create({
            paymentId: savedPayment.id,
            invoiceId: invId,
            amount: amountApplied,
          } as unknown as PaymentAppliedInvoice);
          await appliedRepo.save(appliedRecord);

          // Update invoice state
          const targetInvoice = await invoiceRepo.findOne({
            where: { id: invId, userId: parsedUserId },
          });

          if (targetInvoice) {
            const currentReceived = Number(targetInvoice.received) || 0;
            const newReceived = currentReceived + amountApplied;
            const total = Number(targetInvoice.total) || 0;
            const newRemaining = Math.max(0, total - newReceived);
            const newStatus =
              newRemaining <= 0
                ? "Paid"
                : newReceived > 0
                ? "Partially Paid"
                : targetInvoice.status;

            await invoiceRepo.update(invId, {
              received: newReceived,
              remaining: newRemaining,
              status: newStatus,
            });
          }
        }
      }
    }

    // Re-calculate customer receivables from invoice remaining amounts
    // (receivables are computed on demand in invoice queries)

    const fullPayment = await paymentRepo.findOne({
      where: { id: savedPayment.id },
      relations: ["customer", "template", "appliedInvoices", "appliedInvoices.invoice"],
    });

    return NextResponse.json(
      { payment: fullPayment || savedPayment, id: savedPayment.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { message: "Failed to create payment" },
      { status: 500 }
    );
  }
};

export default createPayment;
