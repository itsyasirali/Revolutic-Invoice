import { NextRequest, NextResponse } from "next/server";
import { In } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { BatchUpdateCustomerPayload } from "@/types/customer";

const batchUpdateCustomers = async (req: NextRequest) => {
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
    const body: BatchUpdateCustomerPayload = await req.json();
    const { customers: customerIds } = body;
    const normalizedStatus = String(body.status || "").toLowerCase();
    const status =
      normalizedStatus === "active"
        ? "Active"
        : normalizedStatus === "inactive"
          ? "inActive"
          : "";

    if (!status) {
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

    const parsedCustomerIds = customerIds
      .map((id) => parseInt(id))
      .filter((id) => Number.isFinite(id));

    const db = await getDatabase();
    const customersRepository = db.getRepository(Customer);

    const updateFilter = { id: In(parsedCustomerIds), organizationId: orgId };

    const result = await customersRepository.update(updateFilter, { status });

    if (!result.affected) {
      return NextResponse.json(
        { message: "No matching customers found to update" },
        { status: 404 },
      );
    }

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
