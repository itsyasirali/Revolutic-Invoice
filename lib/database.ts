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

const dataSource =
  globalForDb.dataSource ??
  new DataSource({
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

globalForDb.dataSource = dataSource;

export const getDatabase = async (): Promise<DataSource> => {
  if (dataSource.isInitialized) {
    return dataSource;
  }

  if (!globalForDb.dataSourceInitPromise) {
    globalForDb.dataSourceInitPromise = dataSource.initialize();
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
