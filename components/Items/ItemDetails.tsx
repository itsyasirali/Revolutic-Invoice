"use client";

import React from "react";
import {
  Package,
  Edit,
  Trash2,
  FileText,
  Type,
  Tag,
  DollarSign,
} from "lucide-react";
import { StatusBadge, EmptyState, Button, PageHeader } from "@/components/ui";
import useItemDetailsView from "@/hooks/items/useItemDetailsView";

const ItemDetails: React.FC = () => {
  const { item, loading, handleEdit, handleDelete, handleBackClick } =
    useItemDetailsView();

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon={FileText}
          title="Item Not Found"
          message="The item you're looking for doesn't exist or data is not available."
          action={{
            label: "Back to Items",
            onClick: handleBackClick,
          }}
        />
      </div>
    );
  }

  return (
    <div className="">
      <PageHeader
        title={item.name || ""}
        showBackButton
        onBack={handleBackClick}
        subtitle={
          <div className="flex items-center gap-3.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              {item.type || "Goods"}
            </span>
            <StatusBadge status={item.status || "Active"} />
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={handleEdit}
              icon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={loading}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className="space-y-6 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-800 mb-4">
                Item Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50/50 rounded-md border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" /> Type
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.type || "Goods"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-md border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Unit
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.unit || ""}
                  </p>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-md border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Selling Price
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.sellingPrice !== undefined
                      ? `PKR ${item.sellingPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : ""}
                  </p>
                </div>
                {item.description && (
                  <div className="md:col-span-2 p-4 bg-gray-50/50 rounded-md border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Description
                    </p>
                    <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
