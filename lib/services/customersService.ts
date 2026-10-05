import { getDatabase } from "@/lib/database";
import { loadCustomersWithTotals } from "@/lib/services/customerFinancials";
import type { Customer } from "@/types/customer";

const fetchCustomersForUser = async (
  userId: number,
  orgId?: number | null,
): Promise<Customer[]> => {
  try {
    const db = await getDatabase();
    const customers = await loadCustomersWithTotals(
      db,
      orgId ? { organizationId: orgId } : { userId },
    );
    return JSON.parse(JSON.stringify(customers));
  } catch (error) {
    console.error("Error fetching customers on server:", error);
    return [];
  }
};

export default fetchCustomersForUser;
