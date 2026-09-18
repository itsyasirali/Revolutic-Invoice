"use client";

import { useState } from "react";
import { solutionData, type SolutionTab } from "@/data/landing/solutionData";

const useSolutionsTabs = () => {
  const [activeTab, setActiveTab] = useState<SolutionTab>("Sales");
  const currentData = solutionData[activeTab];

  return {
    activeTab,
    setActiveTab,
    currentData,
  };
};

export default useSolutionsTabs;
