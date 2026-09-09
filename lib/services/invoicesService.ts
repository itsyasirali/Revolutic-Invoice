import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";

const fetchInvoicesForUser = async (userId: number): Promise<any[]> => {
  try {
    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);

    const invoices = await invoiceRepository
      .createQueryBuilder("invoice")
      .leftJoinAndSelect("invoice.customer", "customer")
      .leftJoinAndSelect("invoice.template", "template")
      .leftJoinAndSelect("invoice.items", "items")
      .leftJoinAndSelect("items.item", "itemDetails")
      .where("invoice.userId = :userId", { userId })
      .orderBy("invoice.createdAt", "DESC")
      .getMany();

    return JSON.parse(JSON.stringify(invoices));
  } catch (error) {
    console.error("Error fetching invoices on server:", error);
    return [];
  }
};

export default fetchInvoicesForUser;
