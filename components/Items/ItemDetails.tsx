"use client";

import React from "react";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import {
  Home,
  ChevronRight,
  FileText,
  Type,
  Tag,
  DollarSign,
} from "lucide-react";
import useItemDetailsView from "@/hooks/items/useItemDetailsView";

const ItemDetails: React.FC = () => {
  const { item, loading, mounted, itemInitials, itemIdDisplay } =
    useItemDetailsView();

  if (!mounted || (loading && !item)) {
    return null;
  }

  if (!item) {
    return null;
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-2">
      {/* 1. Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-sm text-slate-500"
        aria-label="Breadcrumb"
      >
        <Link
          href="/dashboard"
          className="text-primary hover:text-primary/80 transition-colors flex items-center"
          title="Dashboard"
        >
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link
          href="/items"
          className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
        >
          Items
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
          {item.name || "Item Details"}
        </span>
      </nav>

      {/* 2. Item Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar + Title + Status + Item ID */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0 shadow-xs">
            {itemInitials}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {item.name || "Item"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Item ID: {itemIdDisplay}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Item Information Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">
          Item Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-slate-400" /> Type
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {item.type || "Goods"}
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Unit
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {item.unit || ""}
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Selling
              Price
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {item.sellingPrice !== undefined
                ? `PKR ${Number(item.sellingPrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : ""}
            </p>
          </div>

          {item.description && (
            <div className="md:col-span-3 p-4 bg-slate-50/70 rounded-lg border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Description
              </p>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {item.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
