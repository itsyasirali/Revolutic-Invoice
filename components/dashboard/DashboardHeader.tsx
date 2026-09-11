"use client";

import React from "react";

interface DashboardHeaderProps {
  userName?: string;
}

const DashboardHeader = ({
  userName = "Ahmad Shahzad",
}: DashboardHeaderProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
        <span>
          {getGreeting()}, {userName}
        </span>
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">
        Here&apos;s what&apos;s happening with your business today.
      </p>
    </div>
  );
};

export default DashboardHeader;
