import { getDatabase } from "@/lib/database";
import { Invoice } from "@/entities/Invoice";
import { Payment } from "@/entities/Payment";
import { Organization } from "@/entities/Organization";
import type {
  DashboardData,
  DashboardInvoice,
  DashboardKPIs,
  MonthlySummaryMetric,
  RevenuePoint,
  SalesOverviewData,
} from "@/types/dashboard";

import { getCurrencySymbol } from "@/data/countries/countries";
export { getCurrencySymbol };

const getCurrencyRates = async (baseCurrency: string = "PKR") => {
  const base = (baseCurrency || "PKR").toUpperCase().trim();
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Rates fetch failed");
    const data = await res.json();
    return (data.rates || {}) as Record<string, number>;
  } catch {
    // Relative fallback rates referenced to USD
    const usdRates: Record<string, number> = {
      USD: 1,
      PKR: 278,
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.36,
      AUD: 1.52,
      INR: 83.5,
      AED: 3.67,
      SAR: 3.75,
      JPY: 155,
      CNY: 7.23,
      CHF: 0.91,
      SGD: 1.35,
    };
    const baseInUsd = usdRates[base] || 1;
    const rates: Record<string, number> = {};
    Object.keys(usdRates).forEach((cur) => {
      rates[cur] = usdRates[cur] / baseInUsd;
    });
    rates[base] = 1;
    return rates;
  }
};

const convertToOrgCurrency = (
  amount: number,
  sourceCurrency: string,
  targetCurrency: string,
  rates: Record<string, number>,
) => {
  const src = (sourceCurrency || targetCurrency || "PKR").toUpperCase().trim();
  const tgt = (targetCurrency || "PKR").toUpperCase().trim();
  if (src === tgt) return amount;
  const rate = rates[src];
  if (!rate || rate <= 0) return amount;
  return amount / rate;
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

const buildEmptyDashboardData = (currencySymbol: string): DashboardData => ({
  kpis: {
    totalInvoices: {
      label: "Total Invoices",
      amount: 0,
      currency: currencySymbol,
      changePercent: 0,
      isIncrease: true,
      periodLabel: "vs last period",
    },
    totalPayments: {
      label: "Total Payments",
      amount: 0,
      currency: currencySymbol,
      changePercent: 0,
      isIncrease: true,
      periodLabel: "vs last period",
    },
    pendingInvoices: {
      label: "Pending Invoices",
      amount: 0,
      currency: currencySymbol,
      changePercent: 0,
      isIncrease: false,
      periodLabel: "vs last period",
    },
    totalExpenses: {
      label: "Total Expenses",
      amount: 0,
      currency: currencySymbol,
      changePercent: 0,
      isIncrease: true,
      periodLabel: "vs last period",
    },
  },
  revenueOverview: [],
  salesOverview: {
    totalSales: 0,
    currency: currencySymbol,
    segments: {
      paid: { label: "Paid", amount: 0, percentage: 0, color: "#2563EB" },
      partial: { label: "Partial", amount: 0, percentage: 0, color: "#06B6D4" },
      unpaid: { label: "Unpaid", amount: 0, percentage: 0, color: "#F59E0B" },
    },
  },
  recentInvoices: [],
  monthlySummary: [
    { label: "Income", value: `${currencySymbol} 0`, changePercent: 0, isPositive: true, type: "income" },
    { label: "Expenses", value: `${currencySymbol} 0`, changePercent: 0, isPositive: true, type: "expenses" },
    { label: "Net Profit", value: `${currencySymbol} 0`, changePercent: 0, isPositive: true, type: "netProfit" },
    { label: "Invoices Paid", value: "0", changePercent: 0, isPositive: true, type: "invoicesPaid" },
  ],
});

export const getDashboardData = async (
  userId: number,
  orgId?: number | null,
): Promise<DashboardData> => {
  let orgCurrency = "PKR";
  let orgSymbol = "Rs";

  try {
    const db = await getDatabase();
    const orgRepo = db.getRepository(Organization);
    const invoiceRepo = db.getRepository(Invoice);
    const paymentRepo = db.getRepository(Payment);

    // Resolve active organization and its configured currency
    if (orgId) {
      const organization = await orgRepo.findOne({ where: { id: orgId } });
      if (organization?.currency) {
        orgCurrency = organization.currency.toUpperCase().trim();
        orgSymbol = getCurrencySymbol(orgCurrency);
      }
    } else {
      // If no orgId is specified, check if user has a primary organization
      const firstOrg = await orgRepo.findOne({
        where: { userId },
        order: { createdAt: "ASC" },
      });
      if (firstOrg?.currency) {
        orgCurrency = firstOrg.currency.toUpperCase().trim();
        orgSymbol = getCurrencySymbol(orgCurrency);
      }
      return buildEmptyDashboardData(orgSymbol);
    }

    const whereScope = { organizationId: orgId };

    const [invoices, payments] = await Promise.all([
      invoiceRepo.find({
        where: whereScope,
        relations: ["customer"],
        order: { createdAt: "DESC" },
      }),
      paymentRepo.find({
        where: whereScope,
        order: { createdAt: "DESC" },
      }).catch(() => []),
    ]);

    // Fetch exchange rates relative to the organization's currency
    const rates = await getCurrencyRates(orgCurrency);

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

      const totalConverted = convertToOrgCurrency(total, inv.currency || orgCurrency, orgCurrency, rates);
      const receivedConverted = convertToOrgCurrency(received, inv.currency || orgCurrency, orgCurrency, rates);
      const remainingConverted = convertToOrgCurrency(remaining, inv.currency || orgCurrency, orgCurrency, rates);

      totalInvoicesAmount += totalConverted;
      totalPaymentsAmount += receivedConverted;
      pendingInvoicesAmount += remainingConverted;

      const invDate = new Date(inv.invoiceDate || inv.createdAt);
      if (!isNaN(invDate.getTime())) {
        if (invDate >= thirtyDaysAgo && invDate <= now) {
          currentPeriodInvoices += totalConverted;
          currentPeriodPayments += receivedConverted;
          currentPeriodPending += remainingConverted;
        } else if (invDate >= sixtyDaysAgo && invDate < thirtyDaysAgo) {
          previousPeriodInvoices += totalConverted;
          previousPeriodPayments += receivedConverted;
          previousPeriodPending += remainingConverted;
        }

        if (invDate.getFullYear() === currentYear && invDate.getMonth() === currentMonth) {
          thisMonthIncome += receivedConverted;
          if (status === "paid") thisMonthPaidCount += 1;
        } else if (invDate.getFullYear() === prevYear && invDate.getMonth() === prevMonth) {
          prevMonthIncome += receivedConverted;
          if (status === "paid") prevMonthPaidCount += 1;
        }
      }

      if (status === "paid") {
        paidSum += totalConverted;
      } else if (status === "partially paid" || status === "partial") {
        partialSum += remainingConverted;
        paidSum += receivedConverted;
      } else {
        unpaidSum += remainingConverted;
      }
    });

    if (payments && payments.length > 0) {
      const recordedPayments = payments.reduce((acc, p) => {
        return (
          acc +
          convertToOrgCurrency(
            Number(p.amountReceived || 0),
            p.currency || orgCurrency,
            orgCurrency,
            rates,
          )
        );
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
        currency: orgSymbol,
        changePercent: invoicesTrend.percent,
        isIncrease: invoicesTrend.isIncrease,
        periodLabel: "vs last period",
      },
      totalPayments: {
        label: "Total Payments",
        amount: Math.round(totalPaymentsAmount),
        currency: orgSymbol,
        changePercent: paymentsTrend.percent,
        isIncrease: paymentsTrend.isIncrease,
        periodLabel: "vs last period",
      },
      pendingInvoices: {
        label: "Pending Invoices",
        amount: Math.round(pendingInvoicesAmount),
        currency: orgSymbol,
        changePercent: pendingTrend.percent,
        isIncrease: pendingTrend.isIncrease,
        periodLabel: "vs last period",
      },
      totalExpenses: {
        label: "Total Expenses",
        amount: 0,
        currency: orgSymbol,
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
          monthSales += convertToOrgCurrency(
            Number(inv.total || 0),
            inv.currency || orgCurrency,
            orgCurrency,
            rates,
          );
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
      currency: orgSymbol,
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

    // Real Recent Invoices
    const recentInvoices: DashboardInvoice[] = invoices.slice(0, 5).map((inv, idx) => {
      let actualStatus = inv.status || "Draft";
      const st = String(actualStatus).toLowerCase();

      if (
        st === "overdue" ||
        (inv.dueDate &&
          new Date(inv.dueDate) < new Date() &&
          st !== "paid" &&
          st !== "draft" &&
          st !== "cancelled")
      ) {
        actualStatus = "Overdue";
      }

      return {
        id: inv.id,
        indexNumber: idx + 1,
        invoiceNumber: inv.invoiceNumber || `INV-${String(inv.id).padStart(6, "0")}`,
        customerName:
          inv.customer?.displayName ||
          inv.customer?.companyName ||
          "Customer",
        date: formatShortDate(inv.invoiceDate || inv.createdAt),
        status: actualStatus,
        amount: Number(inv.total || 0),
        currency: inv.currency || orgCurrency,
      };
    });

    // Real Monthly Summary
    const monthlySummary: MonthlySummaryMetric[] = [
      {
        label: "Income",
        value: `${orgSymbol} ${Math.round(thisMonthIncome).toLocaleString()}`,
        changePercent: monthIncomeTrend.percent,
        isPositive: monthIncomeTrend.isIncrease,
        type: "income",
      },
      {
        label: "Expenses",
        value: `${orgSymbol} 0`,
        changePercent: 0,
        isPositive: true,
        type: "expenses",
      },
      {
        label: "Net Profit",
        value: `${orgSymbol} ${Math.round(thisMonthIncome).toLocaleString()}`,
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
    return buildEmptyDashboardData(orgSymbol);
  }
};

export default getDashboardData;
