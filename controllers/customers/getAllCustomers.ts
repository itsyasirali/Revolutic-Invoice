import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";
import { loadCustomersWithTotals } from "@/lib/services/customerFinancials";

const getAllCustomers = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const organizationId = await getAuthOrgId(req);
    if (!organizationId) {
      return NextResponse.json({ customers: [] }, { status: 200 });
    }

    const db = await getDatabase();
    // Totals only: invoices and payments are loaded per customer on the detail page.
    const customers = await loadCustomersWithTotals(db, { organizationId });

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Failed to fetch customers", error: error?.message || String(error) },
      { status: 500 },
    );
  }
};

export default getAllCustomers;
