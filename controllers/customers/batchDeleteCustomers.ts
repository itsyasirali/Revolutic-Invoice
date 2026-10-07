import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { Invoice } from "@/entities/Invoice";
import { Payment } from "@/entities/Payment";
import { Quote } from "@/entities/Quote";
import { Expense } from "@/entities/Expense";
import { TimeEntry } from "@/entities/TimeEntry";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { deleteFileIfExists } from "@/utils/customers/customersHelper";
import { BatchDeleteCustomerPayload } from "@/types/customer";

const batchDeleteCustomers = async (req: NextRequest) => {
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

  try {
    const body: BatchDeleteCustomerPayload = await req.json();
    const { customers: customerIds } = body;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { message: "No customers provided" },
        { status: 400 },
      );
    }

    const parsedCustomerIds = customerIds
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    const db = await getDatabase();
    const customersRepository = db.getRepository(Customer);

    const docs = await customersRepository.find({
      where: { id: In(parsedCustomerIds), organizationId: orgId },
      select: ["documents", "id"],
    });

    if (docs.length === 0) {
      return NextResponse.json(
        { message: "Customer(s) not found. Refresh the page and try again." },
        { status: 404 },
      );
    }

    for (const doc of docs) {
      for (const filePath of doc.documents || []) {
        try {
          deleteFileIfExists(filePath);
        } catch (err) {
          console.warn(`Could not delete file: ${filePath}`, err);
        }
      }
    }

    const idsToDelete = docs.map((d) => d.id);

    // Check in parallel if any customers have associated invoices or payments
    const invoiceRepo = db.getRepository(Invoice);
    const paymentRepo = db.getRepository(Payment);

    const checkFilter = { customerId: In(idsToDelete), organizationId: orgId };

    const [invoiceCount, paymentCount] = await Promise.all([
      invoiceRepo.count({
        where: checkFilter,
      }),
      paymentRepo.count({
        where: checkFilter,
      }),
    ]);

    const [quoteCount, expenseCount, timeEntryCount] = await Promise.all([
      db.getRepository(Quote).count({ where: checkFilter }),
      db.getRepository(Expense).count({ where: checkFilter }),
      db.getRepository(TimeEntry).count({ where: checkFilter }),
    ]);
    if (quoteCount + expenseCount + timeEntryCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete customer(s): ${quoteCount} quote(s), ${expenseCount} expense(s) and ${timeEntryCount} time entr${timeEntryCount === 1 ? "y" : "ies"} are linked to these customers. Please delete them first.`,
        },
        { status: 400 },
      );
    }

    if (invoiceCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete customer(s): ${invoiceCount} invoice(s) are linked to these customers. Please delete the associated invoices first.`,
        },
        { status: 400 },
      );
    }

    if (paymentCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete customer(s): ${paymentCount} payment(s) are linked to these customers. Please delete the associated payments first.`,
        },
        { status: 400 },
      );
    }

    const result = await customersRepository.delete({
      id: In(idsToDelete),
      organizationId: orgId,
    });

    return NextResponse.json({
      message: "Customers deleted successfully",
      deletedCount: result.affected,
      ids: idsToDelete,
    });
  } catch (error: any) {
    console.error("Error batch deleting customers:", error);
    const message = error?.detail || error?.message || "Failed to delete customers";
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 },
    );
  }
};

export default batchDeleteCustomers;
