import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";

export async function getCurrencyRates() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/PKR", { next: { revalidate: 3600 } });
    const data = await res.json();
    const rates: Record<string, number> = {};
    Object.keys(data.rates).forEach((cur) => {
      rates[cur] = 1 / data.rates[cur];
    });
    rates.PKR = 1;
    return rates;
  } catch {
    return { PKR: 1, USD: 278, EUR: 305, GBP: 355 };
  }
}

export function convertToPKR(amount: number, currency: string, rates: Record<string, number>) {
  const cur = currency?.toUpperCase() || "PKR";
  return amount * (rates[cur] || 1);
}

export async function getDashboardData(userId: number) {
  const db = await getDatabase();
  const invoiceRepo = db.getRepository(Invoice);
  
  const invoices = await invoiceRepo.find({ where: { userId }, relations: ["customer"] });
  const rates = await getCurrencyRates();

  const emptyBuckets = { current: 0, "1-15": 0, "16-30": 0, "31-45": 0 };
  const buckets = { ...emptyBuckets };
  let paidTotal = 0;

  const MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const salesExpenses = MONTH_LABELS.map((m) => ({
    month: m,
    sales: 0,
    expenses: 0,
    receipts: 0,
  }));

  const currencyStatsMap = new Map<string, { received: number; remaining: number }>();

  invoices.forEach((inv) => {
    const status = String(inv.status ?? "").toLowerCase();
    const currency = inv.currency || "PKR";

    const total = Number(inv.total ?? 0);
    const paid = Number(inv.received ?? 0);
    const remaining = Math.max(0, total - paid);

    const totalPKR = convertToPKR(total, currency, rates);
    const paidPKR = convertToPKR(paid, currency, rates);
    const remainingPKR = convertToPKR(remaining, currency, rates);

    if (status === "sent" || status === "partially paid") {
      buckets.current += remainingPKR;
    }

    if (status === "overdue") {
      const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
      const overdueDays =
        dueDate &&
        Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (overdueDays !== null) {
        if (overdueDays <= 30) {
          buckets["16-30"] += remainingPKR;
        } else {
          buckets["31-45"] += remainingPKR;
        }
      }
    }

    if (status === "paid" || status === "partially paid") {
      const receivedAmount = status === "paid" ? totalPKR : paidPKR;
      paidTotal += receivedAmount;

      const paymentDate = inv.updatedAt;
      const paymentDays =
        paymentDate &&
        Math.floor((Date.now() - new Date(paymentDate).getTime()) / (1000 * 60 * 60 * 24));

      if (paymentDays !== null && paymentDays <= 15) {
        buckets["1-15"] += receivedAmount;
      }
    }

    const d = new Date(inv.invoiceDate ?? inv.createdAt);
    if (!isNaN(d.getTime())) {
      const i = d.getMonth();
      const expenses = Number((inv as Invoice & { expenses?: number }).expenses || 0); // Assuming expenses might be on invoice or 0 for now
      
      salesExpenses[i].sales += totalPKR;
      salesExpenses[i].receipts += paidPKR;
      salesExpenses[i].expenses += convertToPKR(expenses, currency, rates);
    }

    if (!currencyStatsMap.has(currency)) {
      currencyStatsMap.set(currency, { received: 0, remaining: 0 });
    }
    const current = currencyStatsMap.get(currency)!;

    if (status === "paid") {
      current.received += total;
    } else if (status === "partially paid") {
      current.received += paid;
      current.remaining += total - paid;
    } else if (status === "sent" || status === "overdue" || status === "draft") {
      current.remaining += total;
    }

  });

  const totals = salesExpenses.reduce(
    (a, b) => ({
      sales: a.sales + b.sales,
      receipts: a.receipts + b.receipts,
      expenses: a.expenses + b.expenses,
    }),
    { sales: 0, receipts: 0, expenses: 0 }
  );

  const currencyStats = Array.from(currencyStatsMap.entries()).map(([curr, values]) => ({
    currency: curr,
    ...values,
  }));

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer?.displayName || inv.customer?.companyName || "Unknown Customer",
      total: Number(inv.total || 0),
      currency: inv.currency || 'PKR',
      status: inv.status,
      invoiceDate: inv.invoiceDate,
      createdAt: inv.createdAt
    }));

  return {
    receivables: {
      buckets,
      totalReceivables: buckets.current + buckets["16-30"] + buckets["31-45"],
      paidTotal,
    },
    salesExpensesData: {
      data: salesExpenses,
      totals,
    },
    currencyStats,
    recentInvoices,
  };
}
