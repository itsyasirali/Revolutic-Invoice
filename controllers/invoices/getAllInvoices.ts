import { NextRequest, NextResponse } from "next/server";
import { FindOptionsWhere } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { readSession } from "@/lib/session";

const getAllInvoices = async (req: NextRequest) => {
  const { data } = await readSession(req);
  const userId = data.user?.id;

  try {
    const parsedUserId = parseInt(String(userId));

    const status = req.nextUrl.searchParams.get("status") || undefined;
    const customerIdParam = req.nextUrl.searchParams.get("customerId");
    const startDate = req.nextUrl.searchParams.get("startDate") || undefined;
    const endDate = req.nextUrl.searchParams.get("endDate") || undefined;
    const customerId = customerIdParam ? Number(customerIdParam) : undefined;

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);

    const where: FindOptionsWhere<Invoice> = { userId: parsedUserId };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const queryBuilder = invoiceRepository
      .createQueryBuilder("invoice")
      .leftJoinAndSelect("invoice.customer", "customer")
      .leftJoinAndSelect("invoice.template", "template")
      .leftJoinAndSelect("invoice.items", "items")
      .leftJoinAndSelect("items.item", "itemDetails")
      .where(where)
      .orderBy("invoice.createdAt", "DESC");

    if (startDate || endDate) {
      if (startDate) {
        queryBuilder.andWhere("invoice.dueDate >= :startDate", {
          startDate: new Date(startDate),
        });
      }
      if (endDate) {
        queryBuilder.andWhere("invoice.dueDate <= :endDate", {
          endDate: new Date(endDate),
        });
      }
    }

    const invoices = await queryBuilder.getMany();

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { message: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
};

export default getAllInvoices;
