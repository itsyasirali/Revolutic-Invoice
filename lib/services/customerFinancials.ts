import type { DataSource } from "typeorm";
import { Customer } from "@/entities/Customer";
import { Invoice } from "@/entities/Invoice";
import { Payment } from "@/entities/Payment";

export interface CustomerTotals {
  receivables: number;
  unusedCredits: number;
}

/**
 * Per-customer receivables / received totals computed in SQL, so the customer
 * list doesn't have to load (and decrypt) every invoice and payment.
 * Cancelled and draft invoices are ignored (a draft hasn't been issued, so it isn't owed).
 */
export const loadCustomerTotals = async (
  db: DataSource,
  whereScope: { organizationId: number } | { userId: number },
): Promise<Map<number, CustomerTotals>> => {
  const qb = db
    .getRepository(Invoice)
    .createQueryBuilder("inv")
    .select("inv.customerId", "customerId")
    .addSelect("COALESCE(SUM(inv.received), 0)", "received")
    .addSelect("COALESCE(SUM(inv.remaining), 0)", "remaining")
    .where("LOWER(COALESCE(inv.status, '')) <> 'cancelled'")
    .andWhere("LOWER(COALESCE(inv.status, '')) <> 'draft'")
    .groupBy("inv.customerId");

  if ("organizationId" in whereScope) {
    qb.andWhere("inv.organizationId = :scope", { scope: whereScope.organizationId });
  } else {
    qb.andWhere("inv.userId = :scope", { scope: whereScope.userId });
  }

  const rows = await qb.getRawMany<{ customerId: number; received: string; remaining: string }>();
  return new Map(
    rows.map((r) => [
      Number(r.customerId),
      { receivables: Number(r.remaining) || 0, unusedCredits: Number(r.received) || 0 },
    ]),
  );
};

/** Customers (newest first) with their totals; no embedded invoices/payments. */
export const loadCustomersWithTotals = async (
  db: DataSource,
  whereScope: { organizationId: number } | { userId: number },
) => {
  const [customers, totals] = await Promise.all([
    db.getRepository(Customer).find({ where: whereScope, order: { createdAt: "DESC" } }),
    loadCustomerTotals(db, whereScope),
  ]);
  return customers.map((customer) => {
    const t = totals.get(customer.id);
    return {
      ...customer,
      receivables: t?.receivables ?? 0,
      unusedCredits: t?.unusedCredits ?? 0,
    };
  });
};

/** One customer with totals plus its invoices and payments (detail page). */
export const loadCustomerDetail = async (
  db: DataSource,
  orgId: number,
  customerId: number,
) => {
  const customer = await db
    .getRepository(Customer)
    .findOne({ where: { id: customerId, organizationId: orgId } });
  if (!customer) return null;

  const [invoices, payments, totals] = await Promise.all([
    db.getRepository(Invoice).find({ where: { organizationId: orgId, customerId } }),
    db.getRepository(Payment).find({
      where: { organizationId: orgId, customerId },
      order: { paymentDate: "DESC" },
    }),
    loadCustomerTotals(db, { organizationId: orgId }),
  ]);
  const t = totals.get(customerId);

  return {
    ...customer,
    receivables: t?.receivables ?? 0,
    unusedCredits: t?.unusedCredits ?? 0,
    invoices,
    payments: payments.map((payment) => ({ ...payment, appliedInvoices: [] })),
  };
};
