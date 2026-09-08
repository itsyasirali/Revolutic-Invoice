import "reflect-metadata";
import { DataSource } from "typeorm";
import { Pool } from "pg";
import { User } from "@/entities/User";
import { Customer } from "@/entities/Customer";
import { Item } from "@/entities/Item";
import { Invoice } from "@/entities/Invoice";
import { InvoiceItem } from "@/entities/InvoiceItem";
import { Payment } from "@/entities/Payment";
import { PaymentAppliedInvoice } from "@/entities/PaymentAppliedInvoice";
import { Template } from "@/entities/Template";

const globalForDb = globalThis as unknown as {
  dataSource?: DataSource;
  dataSourceInitPromise?: Promise<DataSource>;
  pgPool?: Pool;
};

const getSslConfig = (connectionUrl?: string) => {
  if (process.env.DB_SSL === "true") {
    return { rejectUnauthorized: false };
  }
  if (process.env.DB_SSL === "false") {
    return false;
  }
  if (
    connectionUrl &&
    (connectionUrl.includes("sslmode=require") ||
      connectionUrl.includes("supabase.co") ||
      connectionUrl.includes("neon.tech") ||
      connectionUrl.includes("pooler.supabase.com"))
  ) {
    return { rejectUnauthorized: false };
  }
  return false;
};

const ENTITIES = [
  User,
  Customer,
  Item,
  Invoice,
  InvoiceItem,
  Payment,
  PaymentAppliedInvoice,
  Template,
];

export const getDatabase = async (): Promise<DataSource> => {
  if (globalForDb.dataSource && process.env.NODE_ENV !== "production") {
    // Check if HMR has given us new entity class references by comparing User classes
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const existingEntities = globalForDb.dataSource.options.entities as Function[];
    if (existingEntities && existingEntities.length > 0 && existingEntities[0] !== User) {
      console.log("HMR detected: Entity classes changed, recreating TypeORM DataSource...");
      if (globalForDb.dataSource.isInitialized) {
        await globalForDb.dataSource.destroy();
      }
      globalForDb.dataSource = undefined;
      globalForDb.dataSourceInitPromise = undefined;
    }
  }

  if (!globalForDb.dataSource) {
    const connectionUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    const ssl = getSslConfig(connectionUrl);
    const synchronize =
      process.env.DB_SYNCHRONIZE !== undefined
        ? process.env.DB_SYNCHRONIZE === "true"
        : process.env.NODE_ENV !== "production";

    if (!connectionUrl && !process.env.DB_HOST) {
      const missingVarsMsg =
        "[Database] CRITICAL: Neither DATABASE_URL nor DB_HOST environment variable is configured! Please check your Vercel Environment Variables.";
      console.error(missingVarsMsg);
      throw new Error(missingVarsMsg);
    }

    if (connectionUrl) {
      globalForDb.dataSource = new DataSource({
        type: "postgres",
        url: connectionUrl,
        ssl: ssl || undefined,
        entities: ENTITIES,
        synchronize,
        extra: {
          connectionTimeoutMillis: 10000,
        },
      });
    } else {
      globalForDb.dataSource = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl,
        entities: ENTITIES,
        synchronize,
        extra: {
          connectionTimeoutMillis: 10000,
        },
      });
    }
  }

  if (globalForDb.dataSource.isInitialized) {
    return globalForDb.dataSource;
  }

  if (!globalForDb.dataSourceInitPromise) {
    globalForDb.dataSourceInitPromise = globalForDb.dataSource
      .initialize()
      .then((ds) => {
        console.log("[Database] Connected successfully.");
        return ds;
      })
      .catch((err) => {
        // Reset cached instances on failure so subsequent requests can retry
        globalForDb.dataSource = undefined;
        globalForDb.dataSourceInitPromise = undefined;
        console.error("[Database] Connection initialization failed:", err?.message || err);
        throw err;
      });
  }

  return globalForDb.dataSourceInitPromise;
};

export const getPgPool = (): Pool => {
  if (!globalForDb.pgPool) {
    const connectionUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    const ssl = getSslConfig(connectionUrl);

    if (connectionUrl) {
      globalForDb.pgPool = new Pool({
        connectionString: connectionUrl,
        ssl: ssl || undefined,
        connectionTimeoutMillis: 10000,
      });
    } else {
      globalForDb.pgPool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: ssl || undefined,
        connectionTimeoutMillis: 10000,
      });
    }
  }

  return globalForDb.pgPool;
};

