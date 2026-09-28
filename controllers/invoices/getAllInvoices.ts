import { NextRequest, NextResponse } from "next/server";
import { FindOptionsWhere } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { getAuthUserId, getAuthOrgId } from "@/lib/session";

const getAllInvoices = async (req: NextRequest) => {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const organizationId = await getAuthOrgId(req);
    if (!organizationId) {
      return NextResponse.json({ invoices: [] });
    }

    const status = req.nextUrl.searchParams.get("status") || undefined;
    const customerIdParam = req.nextUrl.searchParams.get("customerId");
    const startDate = req.nextUrl.searchParams.get("startDate") || undefined;
    const endDate = req.nextUrl.searchParams.get("endDate") || undefined;
    const customerId = customerIdParam ? Number(customerIdParam) : undefined;

    const db = await getDatabase();
    const invoiceRepository = db.getRepository(Invoice);

    // Repair invoices fully settled by payments + write-offs that were left
    // in an open status (older payments ignored write-offs).
    await invoiceRepository
      .createQueryBuilder()
      .update(Invoice)
      .set({ status: "Paid", remaining: 0 })
      .where("organizationId = :organizationId", { organizationId })
      .andWhere('"received" > 0')
      .andWhere("LOWER(status) IN (:...open)", {
        open: ["overdue", "partially paid", "sent"],
      })
      .andWhere(
        `"total" - "received" - COALESCE((SELECT SUM(w."amount") FROM "invoice_write_offs" w WHERE w."invoiceId" = "invoices"."id" AND w."reversedAt" IS NULL), 0) <= 0`,
      )
      .execute();

    await invoiceRepository
      .createQueryBuilder()
      .update(Invoice)
      .set({ status: "Overdue" })
      .where("organizationId = :organizationId", { organizationId })
      .andWhere("dueDate < :now", { now: new Date() })
      .andWhere("LOWER(status) NOT IN (:...excluded)", {
        excluded: ["paid", "draft", "cancelled", "overdue", "written off"],
      })
      .execute();

    const where: FindOptionsWhere<Invoice> = { organizationId };

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
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
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { message: "Failed to fetch invoices", error: error?.message || String(error) },
      { status: 500 },
    );
  }
};

export default getAllInvoices;
