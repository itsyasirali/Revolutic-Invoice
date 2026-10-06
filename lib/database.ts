import "reflect-metadata";
import { DataSource, type DataSourceOptions } from "typeorm";
import { User } from "@/entities/User";
import { Customer } from "@/entities/Customer";
import { Item } from "@/entities/Item";
import { Invoice } from "@/entities/Invoice";
import { InvoiceItem } from "@/entities/InvoiceItem";
import { Payment } from "@/entities/Payment";
import { PaymentAppliedInvoice } from "@/entities/PaymentAppliedInvoice";
import { Template } from "@/entities/Template";
import { Organization } from "@/entities/Organization";
import { CustomPlaceholder } from "@/entities/CustomPlaceholder";
import { InvoiceWriteOff } from "@/entities/InvoiceWriteOff";
import { Expense } from "@/entities/Expense";
import { ExpenseCategory } from "@/entities/ExpenseCategory";
import { TimeEntry } from "@/entities/TimeEntry";
import { Quote } from "@/entities/Quote";
import { QuoteItem } from "@/entities/QuoteItem";
import { Project } from "@/entities/Project";
import { ProjectTask } from "@/entities/ProjectTask";
import { PortalUser } from "@/entities/PortalUser";
import { PortalComment } from "@/entities/PortalComment";
import { PortalActivity } from "@/entities/PortalActivity";

const globalForDb = globalThis as unknown as {
  dataSource?: DataSource;
  dataSourceInitPromise?: Promise<DataSource>;
  dataSourceEntityCount?: number;
};

const ENTITIES = [
  User, Customer, Item, Invoice, InvoiceItem, Payment, PaymentAppliedInvoice,
  Template, Organization, CustomPlaceholder, InvoiceWriteOff, Expense,
  ExpenseCategory, TimeEntry, Quote, QuoteItem, Project, ProjectTask,
  PortalUser, PortalComment, PortalActivity,
];

// Minified production builds mangle class names, which makes TypeORM's
// SubjectTopologicalSorter see collisions ("Cyclic dependency: 'p'"). Pin the
// names to the original class names (the entity map keys below).
Object.entries({
  User, Customer, Item, Invoice, InvoiceItem, Payment, PaymentAppliedInvoice,
  Template, Organization, CustomPlaceholder, InvoiceWriteOff, Expense,
  ExpenseCategory, TimeEntry, Quote, QuoteItem, Project, ProjectTask,
  PortalUser, PortalComment, PortalActivity,
}).forEach(([name, cls]) => {
  try {
    Object.defineProperty(cls, "name", { value: name, configurable: true });
  } catch {
    // Ignore if already configured
  }
});

const getSslConfig = (connectionUrl?: string) => {
  if (process.env.DB_SSL === "true") return { rejectUnauthorized: false };
  if (process.env.DB_SSL === "false") return false;
  const needsSsl =
    !!connectionUrl &&
    ["sslmode=require", "supabase.co", "neon.tech", "pooler.supabase.com"].some((s) =>
      connectionUrl.includes(s),
    );
  return needsSsl ? { rejectUnauthorized: false } : false;
};

// Lets lookups by class, class name, or table name resolve even when the class
// identity or name was changed by bundling.
const ensureFindMetadataPatch = (ds: DataSource) => {
  const patched = ds as any;
  if (patched.__findMetadataPatched) return;
  patched.__findMetadataPatched = true;

  const original = patched.findMetadata.bind(ds);
  patched.findMetadata = (target: any) => {
    const result = original(target);
    if (result) return result;

    const name =
      typeof target === "function" ? target.name : typeof target === "string" ? target : "";
    if (!name) return undefined;

    const meta = ds.entityMetadatas.find(
      (m) => m.name === name || m.targetName === name || m.tableName === name,
    );
    if (meta && typeof target === "function") ds.entityMetadatasMap.set(target, meta);
    return meta;
  };
};

const createDataSource = (): DataSource => {
  const connectionUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionUrl && !process.env.DB_HOST) {
    const msg =
      "[Database] CRITICAL: Neither DATABASE_URL nor DB_HOST environment variable is configured! Please check your Vercel Environment Variables.";
    console.error(msg);
    throw new Error(msg);
  }

  const ssl = getSslConfig(connectionUrl);
  const poolMax =
    parseInt(process.env.DB_POOL_MAX || "", 10) || (process.env.VERCEL ? 3 : 10);

  const common = {
    type: "postgres" as const,
    entities: ENTITIES,
    // Schema sync introspects every table over the network on each cold start, so it
    // is opt-in: set DB_SYNCHRONIZE=true locally, keep it off in production.
    synchronize: process.env.DB_SYNCHRONIZE === "true",
    // Serverless instances each have their own pool: keep it small (DB_POOL_MAX to override).
    extra: { max: poolMax, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 },
  };

  const options: DataSourceOptions = connectionUrl
    ? { ...common, url: connectionUrl, ssl: ssl || undefined }
    : {
        ...common,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl,
      };

  console.log(
    `[Database] Initializing connection: ${connectionUrl ? "using URL" : `host ${process.env.DB_HOST}:${options.port ?? 5432}`}, ssl=${Boolean(ssl)}`,
  );
  return new DataSource(options);
};

export const getDatabase = async (): Promise<DataSource> => {
  // Dev HMR keeps the DataSource on globalThis; if entities were added since it
  // was created, drop it so the new entity metadata gets registered.
  if (globalForDb.dataSource && globalForDb.dataSourceEntityCount !== ENTITIES.length) {
    const stale = globalForDb.dataSource;
    const pending = globalForDb.dataSourceInitPromise;
    globalForDb.dataSource = undefined;
    globalForDb.dataSourceInitPromise = undefined;
    try {
      await pending?.catch(() => undefined);
      if (stale.isInitialized) await stale.destroy();
    } catch {
      // ignore teardown errors
    }
  }
  globalForDb.dataSourceEntityCount = ENTITIES.length;

  // Fast path: already connected.
  if (globalForDb.dataSource?.isInitialized) {
    ensureFindMetadataPatch(globalForDb.dataSource);
    return globalForDb.dataSource;
  }

  // Connection already being established: share it.
  if (globalForDb.dataSourceInitPromise) return globalForDb.dataSourceInitPromise;

  const dataSource = (globalForDb.dataSource ??= createDataSource());

  globalForDb.dataSourceInitPromise = dataSource
    .initialize()
    .then((ds) => {
      // Guarantee unique targetNames so SubjectTopologicalSorter never sees duplicates.
      ds.entityMetadatas.forEach((meta) => {
        if (!meta.targetName || meta.targetName.length <= 2) {
          meta.targetName =
            meta.tableName ||
            (typeof meta.target === "function" ? meta.target.name : String(meta.target));
        }
      });
      ensureFindMetadataPatch(ds);
      console.log("[Database] Connected successfully.");
      return ds;
    })
    .catch((err) => {
      // Reset so the next request can retry.
      globalForDb.dataSource = undefined;
      globalForDb.dataSourceInitPromise = undefined;
      console.error("[Database] Connection initialization failed:", err?.message || err);
      throw err;
    });

  return globalForDb.dataSourceInitPromise;
};
