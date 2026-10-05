import type { EntityManager } from "typeorm";
import { getDatabase } from "@/lib/database";
import { Customer } from "@/entities/Customer";
import { Item } from "@/entities/Item";
import { Invoice } from "@/entities/Invoice";
import { InvoiceItem } from "@/entities/InvoiceItem";
import { Payment } from "@/entities/Payment";
import { PaymentAppliedInvoice } from "@/entities/PaymentAppliedInvoice";
import { Template } from "@/entities/Template";
import { Project } from "@/entities/Project";
import { Quote } from "@/entities/Quote";
import { QuoteItem } from "@/entities/QuoteItem";
import { nextSequenceNumber } from "@/lib/numbering";
import { HttpError } from "@/lib/requestContext";
import type {
  CustomerDraft,
  EntityKey,
  ImportDrafts,
  ImportIssue,
  ImportResult,
  InvoiceDraft,
  ItemDraft,
  PaymentDraft,
  ProjectDraft,
  QuoteDraft,
  RowStatus,
} from "@/lib/import/types";

export class ImportValidationError extends HttpError {
  errors: ImportIssue[];
  constructor(errors: ImportIssue[]) {
    super(`Import failed: ${errors.length} problem(s) found. Nothing was saved.`, 422);
    this.name = "ImportValidationError";
    this.errors = errors;
  }
}

/** Thrown at the end of a dry run so the transaction rolls back. */
class DryRunRollback extends Error {
  result: ImportResult;
  constructor(result: ImportResult) {
    super("dry run");
    this.result = result;
  }
}

const text = (v: unknown) => String(v ?? "").trim();
const lower = (v: unknown) => text(v).toLowerCase();
const round2 = (n: number) => Number(n.toFixed(2));

/** Number from an editable field; NaN when the user typed something invalid. */
const toNum = (v: unknown): number => {
  if (v === "" || v === null || v === undefined) return 0;
  return Number(v);
};

const toDate = (v: unknown): Date | null => {
  const s = text(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toDateTime = (v: unknown): Date | undefined => {
  const s = text(v);
  if (!s) return undefined;
  const d = new Date(`${s.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

interface Run {
  m: EntityManager;
  userId: number;
  orgId: number;
  statuses: Partial<Record<EntityKey, RowStatus[]>>;
  errors: ImportIssue[];
  warnings: string[];
  customerIdsByName: Map<string, number>;
  itemIdsByName: Map<string, number>;
  invoiceIdsByNumber: Map<string, number>;
  projectIdsByName: Map<string, number>;
}

const fail = (run: Run, entity: EntityKey, index: number, message: string) => {
  run.errors.push({ entity, index, message });
  run.statuses[entity]![index] = "error";
};

const importCustomers = async (run: Run, drafts: CustomerDraft[]) => {
  const repo = run.m.getRepository(Customer);
  run.statuses.customers = drafts.map(() => "new");

  for (const [i, d] of drafts.entries()) {
    const displayName = text(d.displayName);
    if (!displayName) {
      fail(run, "customers", i, "Display name is required");
      continue;
    }
    if (run.customerIdsByName.has(lower(displayName))) {
      run.statuses.customers![i] = "exists";
      continue;
    }

    const contact = {
      firstName: text(d.firstName),
      lastName: text(d.lastName),
      email: text(d.email),
      contact: text(d.phone),
    };
    const saved = await repo.save(
      repo.create({
        userId: run.userId,
        organizationId: run.orgId,
        customerType: d.customerType === "Individual" ? "Individual" : "Business",
        companyName: text(d.companyName) || undefined,
        displayName,
        currency: text(d.currency) || "USD",
        address: text(d.address) || undefined,
        remarks: text(d.remarks) || undefined,
        status: d.status === "inActive" ? "inActive" : "Active",
        documents: [],
        contacts: Object.values(contact).some(Boolean) ? [contact] : [],
        createdAt: toDateTime(d.createdTime),
      }),
    );
    run.customerIdsByName.set(lower(displayName), saved.id);
  }
};

const importItems = async (run: Run, drafts: ItemDraft[]) => {
  const repo = run.m.getRepository(Item);
  run.statuses.items = drafts.map(() => "new");
  const existing = await repo.find({ where: { organizationId: run.orgId } });

  for (const [i, d] of drafts.entries()) {
    const name = text(d.name);
    const price = toNum(d.sellingPrice);
    if (!name) {
      fail(run, "items", i, "Item name is required");
      continue;
    }
    if (!Number.isFinite(price) || price < 0) {
      fail(run, "items", i, `${name}: selling price must be a number, 0 or more`);
      continue;
    }
    const unit = text(d.unit);
    const type = d.type === "Service" ? "Service" : "Goods";

    const match = existing.find(
      (e) =>
        lower(e.name) === lower(name) &&
        lower(e.unit) === lower(unit) &&
        Number(e.sellingPrice) === price &&
        (e.type || "Goods") === type,
    );
    if (match) {
      if (!run.itemIdsByName.has(lower(name))) run.itemIdsByName.set(lower(name), match.id);
      run.statuses.items![i] = "exists";
      continue;
    }

    const saved = await repo.save(
      repo.create({
        userId: run.userId,
        organizationId: run.orgId,
        type,
        name,
        unit: unit || undefined,
        sellingPrice: price,
        description: text(d.description) || undefined,
        status: d.status === "inActive" ? "inActive" : "Active",
      }),
    );
    existing.push(saved);
    if (!run.itemIdsByName.has(lower(name))) run.itemIdsByName.set(lower(name), saved.id);
  }
};

const importProjects = async (run: Run, drafts: ProjectDraft[]) => {
  const repo = run.m.getRepository(Project);
  run.statuses.projects = drafts.map(() => "new");
  const existing = await repo.find({ where: { organizationId: run.orgId } });
  const BILLING = ["Hourly", "Fixed"];
  const STATUSES = ["Active", "On Hold", "Completed"];

  for (const [i, d] of drafts.entries()) {
    const name = text(d.name);
    if (!name) {
      fail(run, "projects", i, "Project name is required");
      continue;
    }
    const customerId = run.customerIdsByName.get(lower(d.customerName));
    if (!customerId) {
      fail(
        run,
        "projects",
        i,
        `${name}: customer "${text(d.customerName)}" does not exist yet. Import Customers first, or correct the name.`,
      );
      continue;
    }
    const nums = [d.hourlyRate, d.fixedAmount, d.budgetHours, d.budgetAmount].map(toNum);
    if (!nums.every((n) => Number.isFinite(n) && n >= 0)) {
      fail(run, "projects", i, `${name}: rate, amount and budget values must be numbers, 0 or more`);
      continue;
    }
    if (!BILLING.includes(d.billingMethod) || !STATUSES.includes(d.status)) {
      fail(run, "projects", i, `${name}: choose a valid billing method and status`);
      continue;
    }

    const code = text(d.projectNumber);
    const match = existing.find((p) =>
      code
        ? lower(p.projectNumber) === lower(code)
        : lower(p.name) === lower(name) && p.customerId === customerId,
    );
    if (match) {
      run.projectIdsByName.set(lower(name), match.id);
      run.statuses.projects![i] = "exists";
      continue;
    }

    const saved = await repo.save(
      repo.create({
        projectNumber: code || (await nextSequenceNumber(repo, "projectNumber", run.orgId, "PRJ")),
        name,
        description: text(d.description) || null,
        customerId,
        status: d.status,
        billingMethod: d.billingMethod,
        hourlyRate: nums[0],
        fixedAmount: nums[1],
        budgetHours: nums[2],
        budgetAmount: nums[3],
        currency: text(d.currency) || "PKR",
        userId: run.userId,
        organizationId: run.orgId,
      } as unknown as Project),
    );
    existing.push(saved);
    run.projectIdsByName.set(lower(name), saved.id);
  }
};

const importQuotes = async (run: Run, drafts: QuoteDraft[]) => {
  const repo = run.m.getRepository(Quote);
  run.statuses.quotes = drafts.map(() => "new");
  const template = await run.m.getRepository(Template).findOne({
    where: { organizationId: run.orgId, isDefault: true },
  });
  const existing = new Set(
    (await repo.find({ where: { organizationId: run.orgId } })).map((q) => q.quoteNumber),
  );
  const STATUSES = ["Draft", "Sent", "Viewed", "Accepted", "Declined", "Expired"];

  for (const [i, d] of drafts.entries()) {
    const number = text(d.quoteNumber);
    if (!number) {
      fail(run, "quotes", i, "Quote number is required");
      continue;
    }
    const label = `Quote ${number}`;
    if (existing.has(number)) {
      run.statuses.quotes![i] = "exists";
      continue;
    }
    const customerId = run.customerIdsByName.get(lower(d.customerName));
    if (!customerId) {
      fail(
        run,
        "quotes",
        i,
        `${label}: customer "${text(d.customerName)}" does not exist yet. Import Customers first, or correct the name.`,
      );
      continue;
    }
    const quoteDate = toDate(d.quoteDate);
    if (!quoteDate) {
      fail(run, "quotes", i, `${label}: quote date is missing or invalid`);
      continue;
    }
    const expiryDate = toDate(d.expiryDate);
    if (text(d.expiryDate) && !expiryDate) {
      fail(run, "quotes", i, `${label}: expiry date is invalid`);
      continue;
    }
    const projectName = text(d.projectName);
    const projectId = projectName ? run.projectIdsByName.get(lower(projectName)) : undefined;
    if (projectName && !projectId) {
      fail(run, "quotes", i, `${label}: project "${projectName}" does not exist yet. Import Projects first, or clear it.`);
      continue;
    }
    if (!STATUSES.includes(d.status)) {
      fail(run, "quotes", i, `${label}: choose a valid status`);
      continue;
    }

    const totals = [d.subTotal, d.discountPercent, d.discount, d.tax, d.shipping, d.adjustment, d.total].map(toNum);
    if (!totals.every(Number.isFinite)) {
      fail(run, "quotes", i, `${label}: amounts must be numbers`);
      continue;
    }
    const [subTotal, discountPercent, discount, tax, shipping, adjustment, total] = totals;

    const lines = d.lines ?? [];
    if (lines.length === 0) {
      fail(run, "quotes", i, `${label}: add at least one item`);
      continue;
    }
    const badLine = lines.findIndex(
      (l) =>
        !text(l.name) ||
        ![l.quantity, l.rate, l.discount, l.tax, l.amount].map(toNum).every(Number.isFinite) ||
        toNum(l.quantity) <= 0,
    );
    if (badLine >= 0) {
      fail(run, "quotes", i, `${label}: line ${badLine + 1} needs a name, a quantity above 0 and numeric values`);
      continue;
    }
    const linesSum = round2(lines.reduce((sum, l) => sum + toNum(l.amount), 0));
    if (linesSum !== round2(subTotal)) {
      run.warnings.push(`${label}: line items add up to ${linesSum} but subtotal is ${subTotal}`);
    }

    await repo.save(
      repo.create({
        quoteNumber: number,
        customerId,
        templateId: template?.id ?? null,
        quoteDate,
        expiryDate: expiryDate ?? undefined,
        currency: text(d.currency) || "PKR",
        referenceNumber: text(d.referenceNumber) || undefined,
        subTotal,
        discountPercent,
        discount,
        tax,
        shipping,
        adjustment,
        total,
        notes: text(d.notes) || undefined,
        terms: text(d.terms) || undefined,
        status: d.status,
        projectId: projectId ?? null,
        userId: run.userId,
        organizationId: run.orgId,
        items: lines.map((l, idx) =>
          Object.assign(new QuoteItem(), {
            itemId: (text(l.itemName) && run.itemIdsByName.get(lower(l.itemName))) || null,
            name: text(l.name),
            description: text(l.description),
            quantity: toNum(l.quantity),
            rate: toNum(l.rate),
            discount: toNum(l.discount),
            tax: toNum(l.tax),
            amount: toNum(l.amount),
            sortOrder: idx,
          }),
        ),
      } as unknown as Quote),
    );
    existing.add(number);
  }
};

const importInvoices = async (run: Run, drafts: InvoiceDraft[]) => {
  const repo = run.m.getRepository(Invoice);
  run.statuses.invoices = drafts.map(() => "new");
  const template = await run.m.getRepository(Template).findOne({
    where: { organizationId: run.orgId, isDefault: true },
  });

  for (const [i, d] of drafts.entries()) {
    const number = text(d.invoiceNumber);
    if (!number) {
      fail(run, "invoices", i, "Invoice number is required");
      continue;
    }
    const label = `Invoice ${number}`;
    if (run.invoiceIdsByNumber.has(number)) {
      run.statuses.invoices![i] = "exists";
      continue;
    }

    const customerId = run.customerIdsByName.get(lower(d.customerName));
    if (!customerId) {
      fail(
        run,
        "invoices",
        i,
        `${label}: customer "${text(d.customerName)}" does not exist yet. Import Customers first, or correct the name.`,
      );
      continue;
    }
    const invoiceDate = toDate(d.invoiceDate);
    if (!invoiceDate) {
      fail(run, "invoices", i, `${label}: invoice date is missing or invalid`);
      continue;
    }
    if (text(d.dueDate) && !toDate(d.dueDate)) {
      fail(run, "invoices", i, `${label}: due date is invalid`);
      continue;
    }

    const subTotal = toNum(d.subTotal);
    const total = toNum(d.total);
    const balance = toNum(d.balance);
    const discountPercent = toNum(d.discountPercent);
    if (![subTotal, total, balance, discountPercent].every(Number.isFinite)) {
      fail(run, "invoices", i, `${label}: subtotal, total, balance and discount must be numbers`);
      continue;
    }
    if (balance > total) {
      fail(run, "invoices", i, `${label}: balance (${balance}) cannot be more than total (${total})`);
      continue;
    }

    const lines = d.lines ?? [];
    const badLine = lines.findIndex(
      (l) => ![l.quantity, l.rate, l.amount].map(toNum).every(Number.isFinite) || !text(l.title),
    );
    if (badLine >= 0) {
      fail(run, "invoices", i, `${label}: line ${badLine + 1} needs a title and numeric quantity, rate and amount`);
      continue;
    }
    const linesSum = round2(lines.reduce((s, l) => s + toNum(l.amount), 0));
    if (linesSum !== round2(subTotal)) {
      run.warnings.push(`${label}: line items add up to ${linesSum} but subtotal is ${subTotal}`);
    }

    const email = text(d.recipientEmail);
    const saved = await repo.save(
      repo.create({
        invoiceNumber: number,
        invoiceDate,
        dueDate: toDate(d.dueDate) ?? undefined,
        terms: text(d.terms) || undefined,
        subTotal,
        total,
        received: round2(total - balance),
        remaining: balance,
        previousRemaining: 0,
        currency: text(d.currency) || "PKR",
        status: text(d.status) || "Draft",
        notes: text(d.notes) || undefined,
        recipients: email ? [email] : [],
        discountPercent,
        userId: run.userId,
        organizationId: run.orgId,
        customerId,
        templateId: template?.id ?? null,
        items: lines.map((l) => ({
          itemId: (text(l.itemName) && run.itemIdsByName.get(lower(l.itemName))) || null,
          title: text(l.title),
          description: text(l.description),
          quantity: toNum(l.quantity),
          rate: toNum(l.rate),
          amount: toNum(l.amount),
        })) as unknown as InvoiceItem[],
      }),
    );
    run.invoiceIdsByNumber.set(number, saved.id);
  }
};

const importPayments = async (run: Run, drafts: PaymentDraft[]) => {
  const repo = run.m.getRepository(Payment);
  const appliedRepo = run.m.getRepository(PaymentAppliedInvoice);
  const customerRepo = run.m.getRepository(Customer);
  run.statuses.payments = drafts.map(() => "new");

  const existing = await repo.find({ where: { organizationId: run.orgId } });
  const existingByNumber = new Map(existing.map((p) => [Number(p.paymentNumber), p]));

  for (const [i, d] of drafts.entries()) {
    const paymentNumber = text(d.paymentNumber) ? Number(d.paymentNumber) : NaN;
    if (text(d.paymentNumber) && !Number.isInteger(paymentNumber)) {
      fail(run, "payments", i, "Payment number must be a whole number");
      continue;
    }
    const label = `Payment ${text(d.paymentNumber) || i + 1}`;
    const amount = toNum(d.amount);
    const bankCharges = toNum(d.bankCharges);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(bankCharges) || bankCharges < 0) {
      fail(run, "payments", i, `${label}: amount and bank charges must be numbers, 0 or more`);
      continue;
    }
    const paymentDate = toDate(d.paymentDate);
    if (!paymentDate) {
      fail(run, "payments", i, `${label}: payment date is missing or invalid`);
      continue;
    }
    const customerId = run.customerIdsByName.get(lower(d.customerName));
    if (!customerId) {
      fail(
        run,
        "payments",
        i,
        `${label}: customer "${text(d.customerName)}" does not exist yet. Import Customers first, or correct the name.`,
      );
      continue;
    }

    const clash = Number.isNaN(paymentNumber) ? undefined : existingByNumber.get(paymentNumber);
    if (clash) {
      const same =
        Number(clash.amountReceived) === amount &&
        clash.customerId === customerId &&
        new Date(clash.paymentDate).toISOString().slice(0, 10) === paymentDate.toISOString().slice(0, 10);
      if (same) run.statuses.payments![i] = "exists";
      else fail(run, "payments", i, `${label}: payment number ${paymentNumber} is already used by a different payment`);
      continue;
    }

    const applied: { invoiceId: number; amount: number }[] = [];
    let appliedOk = true;
    const seen = new Set<string>();
    for (const a of d.applied ?? []) {
      const invNumber = text(a.invoiceNumber);
      const appliedAmount = toNum(a.amount);
      if (!invNumber && !appliedAmount) continue;
      const invoiceId = run.invoiceIdsByNumber.get(invNumber);
      if (!invoiceId) {
        fail(
          run,
          "payments",
          i,
          `${label}: invoice "${invNumber}" does not exist yet. Import Invoices first, or correct the number.`,
        );
        appliedOk = false;
        break;
      }
      if (seen.has(invNumber) || !Number.isFinite(appliedAmount) || appliedAmount <= 0) {
        fail(run, "payments", i, `${label}: each applied invoice needs a unique number and an amount above 0`);
        appliedOk = false;
        break;
      }
      seen.add(invNumber);
      applied.push({ invoiceId, amount: appliedAmount });
    }
    if (!appliedOk) continue;

    const appliedTotal = round2(applied.reduce((s, a) => s + a.amount, 0));
    if (appliedTotal > amount) {
      fail(run, "payments", i, `${label}: applied total ${appliedTotal} exceeds amount ${amount}`);
      continue;
    }

    const customer = await customerRepo.findOne({ where: { id: customerId } });
    const saved = await repo.save(
      repo.create({
        paymentDate,
        paymentNumber: Number.isNaN(paymentNumber) ? undefined : paymentNumber,
        referenceNo: text(d.referenceNo) || undefined,
        userId: run.userId,
        organizationId: run.orgId,
        customerId,
        customerDisplayName: text(d.customerName) || customer?.displayName || "",
        customerEmail: customer?.contacts?.[0]?.email || undefined,
        paymentMode: text(d.paymentMode) || "Cash",
        status: text(d.status) || "Paid",
        amountReceived: amount,
        bankCharges,
        currency: text(d.currency) || "PKR",
        notes: text(d.notes) || undefined,
        createdAt: toDateTime(d.createdTime),
      }),
    );
    for (const a of applied) {
      await appliedRepo.save(
        appliedRepo.create({ paymentId: saved.id, invoiceId: a.invoiceId, amount: a.amount }),
      );
    }
    if (!Number.isNaN(paymentNumber)) existingByNumber.set(paymentNumber, saved);
    const unused = round2(amount - appliedTotal);
    if (unused > 0) {
      run.warnings.push(`${label}: ${unused} of ${amount} is not applied to any invoice (kept as unused amount)`);
    }
  }
};

/**
 * Saves (possibly user-edited) drafts in one transaction, in dependency order:
 * customers, items, invoices, payments. With `dryRun` everything is executed and
 * then rolled back, so the result is an exact preview of a real import. A real
 * run with any problem rolls back and throws ImportValidationError.
 */
export const commitDrafts = async (
  userId: number,
  orgId: number,
  drafts: ImportDrafts,
  dryRun = false,
): Promise<ImportResult> => {
  const db = await getDatabase();

  try {
    return await db.transaction(async (m) => {
      const run: Run = {
        m,
        userId,
        orgId,
        statuses: {},
        errors: [],
        warnings: [],
        customerIdsByName: new Map(),
        itemIdsByName: new Map(),
        invoiceIdsByNumber: new Map(),
        projectIdsByName: new Map(),
      };

      for (const c of await m.getRepository(Customer).find({ where: { organizationId: orgId } })) {
        if (!run.customerIdsByName.has(lower(c.displayName))) run.customerIdsByName.set(lower(c.displayName), c.id);
      }
      for (const i of await m.getRepository(Item).find({ where: { organizationId: orgId } })) {
        if (!run.itemIdsByName.has(lower(i.name))) run.itemIdsByName.set(lower(i.name), i.id);
      }
      for (const p of await m.getRepository(Project).find({ where: { organizationId: orgId } })) {
        if (!run.projectIdsByName.has(lower(p.name))) run.projectIdsByName.set(lower(p.name), p.id);
      }
      for (const inv of await m.getRepository(Invoice).find({ where: { organizationId: orgId } })) {
        run.invoiceIdsByNumber.set(inv.invoiceNumber, inv.id);
      }

      if (drafts.customers) await importCustomers(run, drafts.customers);
      if (drafts.items) await importItems(run, drafts.items);
      if (drafts.projects) await importProjects(run, drafts.projects);
      if (drafts.quotes) await importQuotes(run, drafts.quotes);
      if (drafts.invoices) await importInvoices(run, drafts.invoices);
      if (drafts.payments) await importPayments(run, drafts.payments);

      const result: ImportResult = {
        statuses: run.statuses,
        errors: run.errors,
        warnings: run.warnings,
      };
      if (dryRun) throw new DryRunRollback(result);
      if (run.errors.length > 0) throw new ImportValidationError(run.errors);
      return result;
    });
  } catch (e) {
    if (e instanceof DryRunRollback) return e.result;
    throw e;
  }
};
