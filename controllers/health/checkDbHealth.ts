import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { HealthDbResponse } from "@/types/health";
import { User } from "@/entities/User";
import { Customer } from "@/entities/Customer";
import { Invoice } from "@/entities/Invoice";
import { Item } from "@/entities/Item";
import { Template } from "@/entities/Template";
import { Payment } from "@/entities/Payment";

const checkDbHealth = async (): Promise<NextResponse<HealthDbResponse>> => {
  const hasHostOrUrl = Boolean(
    process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DB_HOST
  );
  const host = process.env.DB_HOST
    ? process.env.DB_HOST
    : process.env.DATABASE_URL
    ? "configured via URL"
    : undefined;
  const hasUser = Boolean(process.env.DB_USER || process.env.DATABASE_URL);
  const hasDatabase = Boolean(process.env.DB_NAME || process.env.DATABASE_URL);
  const hasAuthSecret = Boolean(
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  );

  const baseConfig = {
    hasHostOrUrl,
    host,
    hasUser,
    hasDatabase,
    hasAuthSecret,
    isProduction: process.env.NODE_ENV === "production",
  };

  try {
    const db = await getDatabase();
    // Run a quick query to verify active connection
    const tables: { tablename: string }[] = await db.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    );

    // Test TypeORM repositories directly to verify entity schemas and relations
    const userRepo = db.getRepository(User);
    const customerRepo = db.getRepository(Customer);
    const invoiceRepo = db.getRepository(Invoice);
    const itemRepo = db.getRepository(Item);
    const templateRepo = db.getRepository(Template);
    const paymentRepo = db.getRepository(Payment);

    const entityCounts = {
      users: await userRepo.count(),
      customers: await customerRepo.count(),
      invoices: await invoiceRepo.count(),
      items: await itemRepo.count(),
      templates: await templateRepo.count(),
      payments: await paymentRepo.count(),
    };

    // Test query customer with ordering (exact query in getAllCustomers)
    let customerSampleTest = "OK";
    try {
      await customerRepo.find({
        take: 1,
        order: { createdAt: "DESC" },
      });
    } catch (err: any) {
      customerSampleTest = `Failed: ${err?.message}`;
    }

    return NextResponse.json({
      status: "connected",
      timestamp: new Date().toISOString(),
      config: baseConfig,
      tablesFound: tables.length,
      entityCounts,
      customerSampleTest,
    });
  } catch (error: any) {
    console.error("[Health API] DB Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        config: baseConfig,
        error: error?.message || "Unknown database connection error",
      },
      { status: 500 }
    );
  }
};

export default checkDbHealth;
