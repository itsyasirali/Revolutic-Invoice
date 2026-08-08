import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { readSession } from "@/lib/session";
import { BatchUpdateCustomerPayload } from "@/types/customer";

const batchUpdateCustomers = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const body: BatchUpdateCustomerPayload = await req.json();
    const { status, customers: customerIds } = body;

    if (!status || (status !== "Active" && status !== "inActive")) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 },
      );
    }
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

    const result = await customersRepository.update(
      { id: In(parsedCustomerIds), userId: parsedUserId },
      { status },
    );

    return NextResponse.json({
      message: "Status updated",
      matched: result.affected,
      modified: result.affected,
    });
  } catch (error) {
    console.error("Error batch updating customers:", error);
    return NextResponse.json(
      { message: "Failed to update customers" },
      { status: 500 },
    );
  }
};

export default batchUpdateCustomers;
