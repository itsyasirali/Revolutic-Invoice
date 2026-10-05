import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { getRequestContext, errorResponse } from "@/lib/requestContext";
import { loadCustomerDetail } from "@/lib/services/customerFinancials";

const getCustomer = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const ctx = await getRequestContext(req);
  if (ctx instanceof NextResponse) return ctx;

  try {
    const customerId = Number((await params).id);
    if (!Number.isInteger(customerId)) {
      return NextResponse.json({ message: "Invalid customer ID" }, { status: 400 });
    }
    const db = await getDatabase();
    const customer = await loadCustomerDetail(db, ctx.orgId, customerId);
    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ customer });
  } catch (error) {
    return errorResponse(error, "Failed to fetch customer");
  }
};

export default getCustomer;
