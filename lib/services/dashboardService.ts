import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { Payment } from "@/entities/Payment";
import type {
  DashboardData,
  DashboardInvoice,
  DashboardKPIs,
  MonthlySummaryMetric,
  RevenuePoint,
  SalesOverviewData,
} from "@/types/dashboard";

const getCurrencyRates = async () => {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/PKR", {
      next: { revalidate: 3600 },
    });
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
};

const convertToPKR = (
  amount: number,
  currency: string,
  rates: Record<string, number>
) => {
  const cur = currency?.toUpperCase() || "PKR";
  return amount * (rates[cur] || 1);
};

const formatShortDate = (dateVal: string | Date | undefined) => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export const getDashboardData = async (userId: number): Promise<DashboardData> => {
  try {
    const db = await getDatabase();
    const invoiceRepo = db.getRepository(Invoice);
    const paymentRepo = db.getRepository(Payment);

    const [invoices, payments] = await Promise.all([
      invoiceRepo.find({
        where: { userId },
        relations: ["customer"],
        order: { createdAt: "DESC" },
      }),
      paymentRepo.find({
        where: { userId },
        order: { createdAt: "DESC" },
      }).catch(() => []),
    ]);

    const rates = await getCurrencyRates();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    let totalInvoicesAmount = 0;
    let totalPaymentsAmount = 0;
    let pendingInvoicesAmount = 0;

    let currentPeriodInvoices = 0;
    let previousPeriodInvoices = 0;
    let currentPeriodPayments = 0;
    let previousPeriodPayments = 0;
    let currentPeriodPending = 0;
    let previousPeriodPending = 0;

    let thisMonthIncome = 0;
    let prevMonthIncome = 0;
    let thisMonthPaidCount = 0;
    let prevMonthPaidCount = 0;

    let paidSum = 0;
    let partialSum = 0;
    let unpaidSum = 0;

    invoices.forEach((inv) => {
      const status = String(inv.status ?? "").toLowerCase();
      const total = Number(inv.total ?? 0);
      const received = Number(inv.received ?? 0);
      const remaining = Math.max(0, total - received);

      const totalPKR = convertToPKR(total, inv.currency || "PKR", rates);
      const receivedPKR = convertToPKR(received, inv.currency || "PKR", rates);
      const remainingPKR = convertToPKR(remaining, inv.currency || "PKR", rates);

      totalInvoicesAmount += totalPKR;
      totalPaymentsAmount += receivedPKR;
      pendingInvoicesAmount += remainingPKR;

      const invDate = new Date(inv.invoiceDate || inv.createdAt);
      if (!isNaN(invDate.getTime())) {
        if (invDate >= thirtyDaysAgo && invDate <= now) {
          currentPeriodInvoices += totalPKR;
          currentPeriodPayments += receivedPKR;
          currentPeriodPending += remainingPKR;
        } else if (invDate >= sixtyDaysAgo && invDate < thirtyDaysAgo) {
          previousPeriodInvoices += totalPKR;
          previousPeriodPayments += receivedPKR;
          previousPeriodPending += remainingPKR;
        }

        if (invDate.getFullYear() === currentYear && invDate.getMonth() === currentMonth) {
          thisMonthIncome += receivedPKR;
          if (status === "paid") thisMonthPaidCount += 1;
        } else if (invDate.getFullYear() === prevYear && invDate.getMonth() === prevMonth) {
          prevMonthIncome += receivedPKR;
          if (status === "paid") prevMonthPaidCount += 1;
        }
      }

      if (status === "paid") {
        paidSum += totalPKR;
      } else if (status === "partially paid" || status === "partial") {
        partialSum += remainingPKR;
        paidSum += receivedPKR;
      } else {
        unpaidSum += remainingPKR;
      }
    });

    if (payments && payments.length > 0) {
      const recordedPayments = payments.reduce((acc, p) => {
        return acc + convertToPKR(Number(p.amountReceived || 0), p.currency || "PKR", rates);
      }, 0);
      if (recordedPayments > totalPaymentsAmount) {
        totalPaymentsAmount = recordedPayments;
      }
    }

    const calcChange = (current: number, previous: number) => {
      if (previous === 0 && current === 0) return { percent: 0, isIncrease: true };
      if (previous === 0 && current > 0) return { percent: 100, isIncrease: true };
      if (previous > 0 && current === 0) return { percent: 100, isIncrease: false };
      const diff = current - previous;
      const pct = Math.round(Math.abs(diff / previous) * 100);
      return { percent: pct, isIncrease: diff >= 0 };
    };

    const invoicesTrend = calcChange(currentPeriodInvoices, previousPeriodInvoices);
    const paymentsTrend = calcChange(currentPeriodPayments, previousPeriodPayments);
    const pendingTrend = calcChange(currentPeriodPending, previousPeriodPending);
    const monthIncomeTrend = calcChange(thisMonthIncome, prevMonthIncome);
    const monthPaidCountTrend = calcChange(thisMonthPaidCount, prevMonthPaidCount);

    const kpis: DashboardKPIs = {
      totalInvoices: {
        label: "Total Invoices",
        amount: Math.round(totalInvoicesAmount),
        currency: "Rs",
        changePercent: invoicesTrend.percent,
        isIncrease: invoicesTrend.isIncrease,
        periodLabel: "vs last period",
      },
      totalPayments: {
        label: "Total Payments",
        amount: Math.round(totalPaymentsAmount),
        currency: "Rs",
        changePercent: paymentsTrend.percent,
        isIncrease: paymentsTrend.isIncrease,
        periodLabel: "vs last period",
      },
      pendingInvoices: {
        label: "Pending Invoices",
        amount: Math.round(pendingInvoicesAmount),
        currency: "Rs",
        changePercent: pendingTrend.percent,
        isIncrease: pendingTrend.isIncrease,
        periodLabel: "vs last period",
      },
      totalExpenses: {
        label: "Total Expenses",
        amount: 0,
        currency: "Rs",
        changePercent: 0,
        isIncrease: true,
        periodLabel: "vs last period",
      },
    };

    // Dynamic Last 6 Calendar Months Revenue Overview
    const revenueOverview: RevenuePoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const mIdx = d.getMonth();
      const mYr = d.getFullYear();

      let monthSales = 0;
      invoices.forEach((inv) => {
        const invDate = new Date(inv.invoiceDate || inv.createdAt);
        if (!isNaN(invDate.getTime()) && invDate.getMonth() === mIdx && invDate.getFullYear() === mYr) {
          monthSales += convertToPKR(Number(inv.total || 0), inv.currency || "PKR", rates);
        }
      });

      revenueOverview.push({
        month: mName,
        income: Math.round(monthSales),
        expenses: 0,
      });
    }

    // Sales Overview Donut Calculation
    const totalSales = Math.round(totalInvoicesAmount);
    const sumAll = paidSum + partialSum + unpaidSum || 1;

    const salesOverview: SalesOverviewData = {
      totalSales,
      currency: "Rs",
      segments: {
        paid: {
          label: "Paid",
          amount: Math.round(paidSum),
          percentage: totalSales > 0 ? Math.round((paidSum / sumAll) * 100) : 0,
          color: "#1AA3FF",
        },
        partial: {
          label: "Partial",
          amount: Math.round(partialSum),
          percentage: totalSales > 0 ? Math.round((partialSum / sumAll) * 100) : 0,
          color: "#06B6D4",
        },
        unpaid: {
          label: "Unpaid",
          amount: Math.round(unpaidSum),
          percentage: totalSales > 0 ? Math.round((unpaidSum / sumAll) * 100) : 0,
          color: "#F59E0B",
        },
      },
    };

    // Real Recent Invoices: pure real data only, zero dummy entries
    const recentInvoices: DashboardInvoice[] = invoices.slice(0, 5).map((inv, idx) => {
      let statusNormalized: "Paid" | "Partial" | "Unpaid" | "Overdue" | "Draft" = "Paid";
      const st = String(inv.status || "").toLowerCase();
      if (st.includes("paid") && !st.includes("part")) statusNormalized = "Paid";
      else if (st.includes("part")) statusNormalized = "Partial";
      else if (st.includes("overdue")) statusNormalized = "Overdue";
      else if (st.includes("draft")) statusNormalized = "Draft";
      else statusNormalized = "Unpaid";

      return {
        id: inv.id,
        indexNumber: idx + 1,
        invoiceNumber: inv.invoiceNumber || `INV-${String(inv.id).padStart(6, "0")}`,
        customerName:
          inv.customer?.displayName ||
          inv.customer?.companyName ||
          "Customer",
        date: formatShortDate(inv.invoiceDate || inv.createdAt),
        status: statusNormalized,
        amount: Number(inv.total || 0),
        currency: inv.currency || "PKR",
      };
    });

    // Real Monthly Summary
    const monthlySummary: MonthlySummaryMetric[] = [
      {
        label: "Income",
        value: `Rs ${Math.round(thisMonthIncome).toLocaleString()}`,
        changePercent: monthIncomeTrend.percent,
        isPositive: monthIncomeTrend.isIncrease,
        type: "income",
      },
      {
        label: "Expenses",
        value: "Rs 0",
        changePercent: 0,
        isPositive: true,
        type: "expenses",
      },
      {
        label: "Net Profit",
        value: `Rs ${Math.round(thisMonthIncome).toLocaleString()}`,
        changePercent: monthIncomeTrend.percent,
        isPositive: monthIncomeTrend.isIncrease,
        type: "netProfit",
      },
      {
        label: "Invoices Paid",
        value: `${thisMonthPaidCount}`,
        changePercent: monthPaidCountTrend.percent,
        isPositive: monthPaidCountTrend.isIncrease,
        type: "invoicesPaid",
      },
    ];

    return {
      kpis,
      revenueOverview,
      salesOverview,
      recentInvoices,
      monthlySummary,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      kpis: {
        totalInvoices: {
          label: "Total Invoices",
          amount: 0,
          currency: "Rs",
          changePercent: 0,
          isIncrease: true,
          periodLabel: "vs last period",
        },
        totalPayments: {
          label: "Total Payments",
          amount: 0,
          currency: "Rs",
          changePercent: 0,
          isIncrease: true,
          periodLabel: "vs last period",
        },
        pendingInvoices: {
          label: "Pending Invoices",
          amount: 0,
          currency: "Rs",
          changePercent: 0,
          isIncrease: false,
          periodLabel: "vs last period",
        },
        totalExpenses: {
          label: "Total Expenses",
          amount: 0,
          currency: "Rs",
          changePercent: 0,
          isIncrease: true,
          periodLabel: "vs last period",
        },
      },
      revenueOverview: [],
      salesOverview: {
        totalSales: 0,
        currency: "Rs",
        segments: {
          paid: { label: "Paid", amount: 0, percentage: 0, color: "#2563EB" },
          partial: { label: "Partial", amount: 0, percentage: 0, color: "#06B6D4" },
          unpaid: { label: "Unpaid", amount: 0, percentage: 0, color: "#F59E0B" },
        },
      },
      recentInvoices: [],
      monthlySummary: [
        { label: "Income", value: "Rs 0", changePercent: 0, isPositive: true, type: "income" },
        { label: "Expenses", value: "Rs 0", changePercent: 0, isPositive: true, type: "expenses" },
        { label: "Net Profit", value: "Rs 0", changePercent: 0, isPositive: true, type: "netProfit" },
        { label: "Invoices Paid", value: "0", changePercent: 0, isPositive: true, type: "invoicesPaid" },
      ],
    };
  }
};

export default getDashboardData;
