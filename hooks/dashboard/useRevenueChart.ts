"use client";

import { useMemo, useState } from "react";
import type { RevenuePoint } from "@/types/dashboard";

export const REVENUE_PERIODS = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
] as const;

/** Period filter for the revenue chart: 1M shows weekly points, others the last N months. */
const useRevenueChart = (data: RevenuePoint[], weeklyData: RevenuePoint[] = []) => {
  const [activePeriod, setActivePeriod] = useState<number>(6);
  const isWeekly = activePeriod === 1;

  const visibleData = useMemo(() => {
    if (isWeekly) return weeklyData;
    return data.slice(Math.max(data.length - activePeriod, 0));
  }, [data, weeklyData, activePeriod, isWeekly]);

  const periodLabel = REVENUE_PERIODS.find((p) => p.months === activePeriod)?.label || "6M";

  return { activePeriod, setActivePeriod, isWeekly, visibleData, periodLabel };
};

export default useRevenueChart;
