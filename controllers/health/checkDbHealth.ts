import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database";
import { HealthDbResponse } from "@/types/health";

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

    return NextResponse.json({
      status: "connected",
      timestamp: new Date().toISOString(),
      config: baseConfig,
      tablesFound: tables.length,
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
