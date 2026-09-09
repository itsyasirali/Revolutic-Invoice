import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { Invoice } from "@/entities/Invoice";
import { Payment } from "@/entities/Payment";
import { getAuthUserId } from "@/lib/session";
import { deleteFileIfExists } from "@/utils/customers/customersHelper";

const deleteCustomer = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { message: "Invalid customer ID" },
        { status: 400 },
      );
    }
    const parsedUserId = userId;

    const db = await getDatabase();
    const customersRepository = db.getRepository(Customer);

    const customer = await customersRepository.findOne({
      where: { id: customerId, userId: parsedUserId },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    // Check if customer has associated invoices
    const invoiceRepo = db.getRepository(Invoice);
    const invoiceCount = await invoiceRepo.count({
      where: { customerId, userId: parsedUserId },
    });
    if (invoiceCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete customer: ${invoiceCount} invoice(s) are linked to this customer. Please delete the associated invoices first.`,
        },
        { status: 400 },
      );
    }

    // Check if customer has associated payments
    const paymentRepo = db.getRepository(Payment);
    const paymentCount = await paymentRepo.count({
      where: { customerId, userId: parsedUserId },
    });
    if (paymentCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete customer: ${paymentCount} payment(s) are linked to this customer. Please delete the associated payments first.`,
        },
        { status: 400 },
      );
    }

    // Clean up document files
    for (const filePath of customer.documents || []) {
      try {
        deleteFileIfExists(filePath);
      } catch (err) {
        console.warn(`Could not delete file: ${filePath}`, err);
      }
    }

    const result = await customersRepository.delete({
      id: customerId,
      userId: parsedUserId,
    });

    if (result.affected === 0) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    const message = error?.detail || error?.message || "Failed to delete customer";
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 },
    );
  }
};

export default deleteCustomer;
