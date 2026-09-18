"use client";

import { useState } from "react";
import type { UseBillingViewReturn } from "@/types/landing";

const useBillingView = (): UseBillingViewReturn => {
  const [isAnnual, setIsAnnual] = useState(false);

  return {
    isAnnual,
    selectMonthly: () => setIsAnnual(false),
    selectAnnual: () => setIsAnnual(true),
  };
};

export default useBillingView;
