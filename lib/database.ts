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
    globalForDb.dataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        Customer,
        Item,
        Invoice,
        InvoiceItem,
        Payment,
        PaymentAppliedInvoice,
        Template,
      ],
      synchronize: true,
    });
  }

  if (globalForDb.dataSource.isInitialized) {
    return globalForDb.dataSource;
  }

  if (!globalForDb.dataSourceInitPromise) {
    globalForDb.dataSourceInitPromise = globalForDb.dataSource.initialize();
  }

  return globalForDb.dataSourceInitPromise;
};

export const getPgPool = (): Pool => {
  if (!globalForDb.pgPool) {
    globalForDb.pgPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  return globalForDb.pgPool;
};
