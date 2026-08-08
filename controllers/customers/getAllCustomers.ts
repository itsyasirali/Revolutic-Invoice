import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { Invoice } from "@/entities/Invoice";
import { Payment } from "@/entities/Payment";
import { readSession } from "@/lib/session";

const getAllCustomers = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const parsedUserId = parseInt(String(userId));

    const db = await getDatabase();
    const customersRepository = db.getRepository(Customer);
    const invoicesRepository = db.getRepository(Invoice);
    const paymentsRepository = db.getRepository(Payment);

    const customers = await customersRepository.find({
      where: { userId: parsedUserId },
      order: { createdAt: "DESC" },
    });

    const invoices = await invoicesRepository.find({
      where: { userId: parsedUserId },
    });
    const payments = await paymentsRepository.find({
      where: { userId: parsedUserId },
      order: { paymentDate: "DESC" },
    });

    const customersWithFinancials = customers.map((customer) => {
      const customerObj = { ...customer };
      const customerId = customer.id;

      const customerInvoices = invoices.filter(
        (inv) => inv.customerId === customerId,
      );

      const customerPayments = payments.filter(
        (payment) => payment.customerId === customerId,
      );

      let received = 0;
      let remaining = 0;

      customerInvoices.forEach((invoice) => {
        const status = (invoice.status || "").toLowerCase();
        if (status === "draft" || status === "cancelled") return;

        const invoiceTotal = parseFloat(invoice.total?.toString() || "0");
        const invoiceReceived = parseFloat(
          invoice.received?.toString() || "0",
        );
        let invoiceRemaining = parseFloat(
          invoice.remaining?.toString() || "0",
        );

        if (invoice.remaining == null) {
          invoiceRemaining = Math.max(0, invoiceTotal - invoiceReceived);
        }

        received += invoiceReceived;
        remaining += invoiceRemaining;
      });

      return {
        ...customerObj,
        receivables: remaining,
        unusedCredits: received,
        invoices: customerInvoices,
        payments: customerPayments.map((payment) => {
          const appliedWithDetails = (payment.appliedInvoices || []).map(
            (applied: { invoiceId: number; invoiceNumber?: string; amount?: number }) => {
              const matchedInvoice = invoices.find(
                (inv) => inv.id === applied.invoiceId,
              );
              return {
                ...applied,
                invoiceNumber:
                  matchedInvoice?.invoiceNumber ||
                  applied.invoiceNumber ||
                  "Unknown Invoice",
                invoiceAmount: matchedInvoice?.total || applied.amount || 0,
              };
            },
          );

          return {
            ...payment,
            appliedInvoices: appliedWithDetails,
          };
        }),
      };
    });

    return NextResponse.json({ customers: customersWithFinancials });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 },
    );
  }
};

export default getAllCustomers;
