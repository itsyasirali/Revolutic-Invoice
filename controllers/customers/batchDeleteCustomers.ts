import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { getToken } from "next-auth/jwt";
import { deleteFileIfExists } from "@/utils/customers/customersHelper";
import { BatchDeleteCustomerPayload } from "@/types/customer";

const batchDeleteCustomers = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const data = { user: token };
  const userId = data.user?.id;

  try {
    const body: BatchDeleteCustomerPayload = await req.json();
    const { customers: customerIds } = body;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { message: "No customers provided" },
        { status: 400 },
      );
    }

    const parsedUserId = parseInt(String(userId));
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
    const result = await customersRepository.delete({
      id: In(idsToDelete),
      userId: parsedUserId,
    });

    return NextResponse.json({
      message: "Customers deleted successfully",
      deletedCount: result.affected,
      ids: idsToDelete,
    });
  } catch (error) {
    console.error("Error batch deleting customers:", error);
    return NextResponse.json(
      { message: "Failed to delete customers" },
      { status: 500 },
    );
  }
};

export default batchDeleteCustomers;
