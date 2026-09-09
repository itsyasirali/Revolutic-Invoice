import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { Invoice } from "@/entities/Invoice";
import { Payment } from "@/entities/Payment";
import { getAuthUserId } from "@/lib/session";
import { deleteFileIfExists } from "@/utils/customers/customersHelper";
import { BatchDeleteCustomerPayload } from "@/types/customer";

const batchDeleteCustomers = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    const parsedUserId = userId;
    const parsedCustomerIds = customerIds.map((id) => parseInt(id));

    const db = await getDatabase();
    const customersRepository = db.getRepository(Customer);

    const docs = await customersRepository.find({
      where: { id: In(parsedCustomerIds), userId: parsedUserId },
      select: ["documents", "id"],
    });

    if (docs.length === 0) {
      return NextResponse.json(
        { message: "No valid parameters provided" },
        { status: 400 },
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

    const [invoiceCount, paymentCount] = await Promise.all([
      invoiceRepo.count({
        where: { customerId: In(idsToDelete), userId: parsedUserId },
      }),
      paymentRepo.count({
        where: { customerId: In(idsToDelete), userId: parsedUserId },
      }),
    ]);

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
      userId: parsedUserId,
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
