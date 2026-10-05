import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";

const fetchInvoicesForUser = async (
  userId: number,
  orgId?: number | null,
): Promise<any[]> => {
  try {
    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);

    const queryBuilder = invoiceRepository
      .createQueryBuilder("invoice")
      .leftJoinAndSelect("invoice.customer", "customer")
      .leftJoinAndSelect("invoice.template", "template")
      .leftJoinAndSelect("invoice.items", "items")
      .leftJoinAndSelect("items.item", "itemDetails")
      .leftJoinAndSelect("invoice.writeOffs", "writeOffs")
      .leftJoin("invoice.quote", "sourceQuote")
      .addSelect(["sourceQuote.id", "sourceQuote.quoteNumber"])
      .leftJoin("invoice.expenses", "sourceExpense")
      .addSelect(["sourceExpense.id", "sourceExpense.expenseNumber"])
      .leftJoin("invoice.timeEntries", "sourceTime")
      .addSelect(["sourceTime.id", "sourceTime.entryNumber"]);

    if (orgId) {
      queryBuilder.where("invoice.organizationId = :orgId", { orgId });
    } else {
      queryBuilder.where("invoice.userId = :userId", { userId });
    }

    const invoices = await queryBuilder
      .orderBy("invoice.createdAt", "DESC")
      .getMany();

    return JSON.parse(JSON.stringify(invoices));
  } catch (error) {
    console.error("Error fetching invoices on server:", error);
    return [];
  }
};

export default fetchInvoicesForUser;
