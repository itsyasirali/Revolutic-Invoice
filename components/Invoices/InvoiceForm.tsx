"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Settings, X, Eye, Info, Mail, Tag } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import { Button, PageHeader, Input, Select, Checkbox } from "@/components/ui";
import useInvoiceForm from "@/hooks/invoices/useInvoiceForm";
import InvoiceTemplateSelector from "./InvoiceTemplateSelector";
import type { InvoiceCustomer } from "@/types/invoice";
import type { SelectOption } from "@/types/common";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const InvoiceForm = () => {
  const {
    isEditMode,
    items,
    invoiceData,
    invoiceLoading,
    invoiceError,
    isSubmitting,
    filteredCustomers,
    customersLoading,
    itemsLoading,
    saving,
    updating,
    customers,
    itemsData,
    selectCustomer,
    selectItem,
    updateItem,
    addNewRow,
    deleteItem,
    handleInvoiceChange,
    handleTermsChange,
    handleSaveDraft,
    handlePreview,
    handleCancel,
    handleSaveAndSend,
    calculateTotal,
    calculateSubtotal,
    showTemplateSelector,
    openTemplateSelector,
    closeTemplateSelector,
    busy,
    isFormValid,
    includePreviousRemaining,
    setIncludePreviousRemaining,
    getPreviousRemainingBase,
    customNumbering,
    toggleCustomNumbering,
  } = useInvoiceForm();

  const hasCustomer = !!invoiceData.customerId;

  const customerOptions: SelectOption[] = useMemo(() => {
    const list =
      customers && customers.length > 0 ? customers : filteredCustomers;
    const opts: SelectOption[] = list.map((customer) => {
      const name =
        customer.displayName || customer.companyName || "Unnamed Customer";
      const email = customer.contacts?.[0]?.email || "";
      const initial = (name || "?").trim().charAt(0).toUpperCase();

      return {
        label: name,
        value: String(customer.id),
        description: email,
        avatar: (
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600 font-bold flex items-center justify-center text-sm shrink-0">
            {initial}
          </div>
        ),
        subtitle: email ? (
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>{email}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 opacity-80">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>No email provided</span>
          </span>
        ),
      };
    });

    if (
      invoiceData.customerId &&
      !opts.some((opt) => opt.value === String(invoiceData.customerId))
    ) {
      const name = invoiceData.customerName || "Selected Customer";
      const email = invoiceData.customerEmail || "";
      const initial = (name || "?").trim().charAt(0).toUpperCase();

      opts.unshift({
        label: name,
        value: String(invoiceData.customerId),
        description: email,
        avatar: (
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600 font-bold flex items-center justify-center text-sm shrink-0">
            {initial}
          </div>
        ),
        subtitle: email ? (
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>{email}</span>
          </span>
        ) : undefined,
      });
    }

    return opts;
  }, [
    customers,
    filteredCustomers,
    invoiceData.customerId,
    invoiceData.customerName,
    invoiceData.customerEmail,
  ]);

  const getItemOptions = (
    currentItemId?: string,
    currentItemRowId?: number,
  ): SelectOption[] => {
    const opts: SelectOption[] = itemsData
      .filter(
        (invItem) =>
          String(invItem.id) === String(currentItemId) ||
          (String(invItem.status || "Active").toLowerCase() !== "inactive" &&
            !items.some(
              (i) => i.itemId === String(invItem.id) && i.id !== currentItemRowId,
            )),
      )
      .map((invItem) => {
        const name = invItem.name || "Unnamed Item";
        const initial = (name || "?").trim().charAt(0).toUpperCase();
        const priceStr =
          invItem.sellingPrice !== undefined
            ? `${invItem.sellingPrice} ${invoiceData.currency}`
            : "";
        const unitStr = invItem.unit ? ` | ${invItem.unit}` : "";

        return {
          label: name,
          value: String(invItem.id),
          description: `${priceStr}${unitStr}`,
          avatar: (
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600 font-bold flex items-center justify-center text-sm shrink-0">
              {initial}
            </div>
          ),
          subtitle: priceStr ? (
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span>
                {priceStr}
                {unitStr}
              </span>
            </span>
          ) : undefined,
        };
      });

    if (
      currentItemId &&
      !opts.some((opt) => opt.value === String(currentItemId))
    ) {
      const matched = itemsData.find(
        (it) => String(it.id) === String(currentItemId),
      );
      const name = matched ? matched.name : "Selected Item";
      const initial = (name || "?").trim().charAt(0).toUpperCase();

      opts.unshift({
        label: name,
        value: String(currentItemId),
        avatar: (
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 text-white font-bold flex items-center justify-center text-sm shrink-0">
            {initial}
          </div>
        ),
        description: "",
        subtitle: undefined,
      });
    }

    return opts;
  };

  if (isEditMode && invoiceLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <PageHeader title="Edit Invoice" onBack={handleCancel} />
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading invoice...
        </div>
      </div>
    );
  }

  if (isEditMode && invoiceError) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <PageHeader title="Edit Invoice" onBack={handleCancel} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-600">
          <p>{invoiceError}</p>
          <Button type="button" onClick={handleCancel} variant="primary" size="md">
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader
        title={isEditMode ? "Edit Invoice" : "New Invoice"}
        onBack={handleCancel}
      />

      <InvoiceTemplateSelector
        isOpen={showTemplateSelector}
        onClose={closeTemplateSelector}
        onSelect={(template) => handleInvoiceChange("templateId", template.id)}
        currentTemplateId={invoiceData.templateId}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveAndSend();
        }}
        className="flex-1 flex flex-col"
      >
        <div className="flex-1 py-8 px-4">
          <div className="flex flex-col gap-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  Customer Details
                  <Info className="w-4 h-4 text-gray-400" />
                </label>

                <div>
                  <div className="grid grid-cols-1 gap-4">
                    <Select
                      label="Customer"
                      value={
                        invoiceData.customerId
                          ? String(invoiceData.customerId)
                          : ""
                      }
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const list =
                          customers && customers.length > 0
                            ? customers
                            : filteredCustomers;
                        const found = list.find(
                          (c) => String(c.id) === selectedId,
                        );
                        if (found) {
                          selectCustomer(found as InvoiceCustomer);
                        }
                      }}
                      options={customerOptions}
                      placeholder={
                        customersLoading
                          ? "Loading customers..."
                          : "Select a customer"
                      }
                      disabled={isEditMode}
                      searchable
                      searchPlaceholder="Search customers..."
                      fullWidth
                    />

                    <Input
                      label="Email"
                      value={invoiceData.customerEmail}
                      placeholder="Customer Email"
                      readOnly
                      fullWidth
                      className="bg-gray-50/50"
                    />
                    <Input
                      label="Phone"
                      value={invoiceData.customerPhone}
                      placeholder="Customer Phone"
                      readOnly
                      fullWidth
                      className="bg-gray-50/50"
                    />
                    <Input
                      label="Address"
                      value={invoiceData.customerAddress}
                      placeholder="Customer Address"
                      readOnly
                      fullWidth
                      className="bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  Invoice Details
                  <Settings className="w-4 h-4 text-gray-400" />
                </label>

                <div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <Input
                        label="Invoice Number"
                        value={
                          customNumbering
                            ? invoiceData.invoiceNumber
                            : invoiceData.invoiceNumber ||
                              (hasCustomer
                                ? "Auto-generated on save"
                                : "Select a customer first")
                        }
                        onChange={(e) =>
                          handleInvoiceChange("invoiceNumber", e.target.value)
                        }
                        readOnly={!customNumbering || !hasCustomer}
                        disabled={!hasCustomer}
                        fullWidth
                        className={`pr-10 ${
                          !customNumbering || !hasCustomer
                            ? "bg-gray-50/50 text-gray-400"
                            : ""
                        }`}
                      />
                      <Settings
                        className="absolute right-3 top-[34px] w-4 h-4 text-gray-400 cursor-pointer hover:text-primary transition-colors"
                        onClick={openTemplateSelector}
                      />
                    </div>

                    {!isEditMode && (
                      <label className="flex items-center gap-2 -mt-2 text-xs text-gray-500 cursor-pointer select-none">
                        <Checkbox
                          checked={customNumbering}
                          onChange={toggleCustomNumbering}
                          disabled={!hasCustomer}
                        />
                        Use a custom number for this customer (e.g. Ahmad-1)
                      </label>
                    )}

                    <Select
                      label="Payment Terms"
                      value={invoiceData.terms}
                      onChange={(e) => handleTermsChange(e.target.value)}
                      disabled={!hasCustomer}
                      fullWidth
                      options={[
                        {
                          label: "Due end of next month",
                          value: "Due end of next month",
                        },
                        {
                          label: "Due end of the month",
                          value: "Due end of the month",
                        },
                        {
                          label: "Due on Receipt",
                          value: "Due on Receipt",
                        },
                        { label: "Net 15", value: "Net 15" },
                        { label: "Net 30", value: "Net 30" },
                        { label: "Net 45", value: "Net 45" },
                        { label: "Net 60", value: "Net 60" },
                      ]}
                    />

                    <Input
                      type="date"
                      label="Invoice Date"
                      value={invoiceData.invoiceDate}
                      onChange={(e) =>
                        handleInvoiceChange("invoiceDate", e.target.value)
                      }
                      disabled={!hasCustomer}
                      fullWidth
                    />

                    <Input
                      type="date"
                      label="Due Date"
                      value={invoiceData.dueDate}
                      onChange={(e) =>
                        handleInvoiceChange("dueDate", e.target.value)
                      }
                      fullWidth
                      readOnly
                      className="bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Item Details
                </label>
              </div>

              <div className="bg-white border border-gray-100">
                <div className="bg-gray-200 px-6 py-4 border-b border-gray-100 hidden md:block">
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="col-span-5">Item Details</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                </div>

                <div className="bg-gray-50">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        <div className="md:col-span-5">
                          <Select
                            showLabel={false}
                            value={
                              item.itemId
                                ? String(item.itemId)
                                : itemsData.find((it) => it.name === item.name)
                                      ?.id
                                  ? String(
                                      itemsData.find(
                                        (it) => it.name === item.name,
                                      )?.id,
                                    )
                                  : ""
                            }
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const found = itemsData.find(
                                (it) => String(it.id) === selectedId,
                              );
                              if (found) {
                                selectItem(
                                  item.id,
                                  found as unknown as Parameters<
                                    typeof selectItem
                                  >[1],
                                );
                              }
                            }}
                            options={getItemOptions(item.itemId, item.id)}
                            placeholder={
                              !hasCustomer
                                ? "Select a customer first"
                                : itemsLoading
                                  ? "Loading items..."
                                  : "Select an item"
                            }
                            disabled={!hasCustomer}
                            searchable
                            searchPlaceholder="Search items..."
                            fullWidth
                          />
                          {(item.itemId || item.name) && (
                            <textarea
                              value={item.description || ""}
                              onChange={(e) =>
                                updateItem(item.id, "description", e.target.value)
                              }
                              rows={2}
                              placeholder="Item description (optional) - supports %Placeholders%"
                              className="mt-2 w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-y"
                            />
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2 md:hidden mb-1 font-bold text-xs text-gray-500">
                            QTY
                          </div>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                updateItem(
                                  item.id,
                                  "quantity",
                                  val === "." ? "0." : val,
                                );
                              }
                            }}
                            disabled={!hasCustomer}
                            fullWidth
                            className="text-center"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2 md:hidden mb-1 font-bold text-xs text-gray-500">
                            RATE
                          </div>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={item.rate}
                            readOnly
                            fullWidth
                            className="text-right"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="text-xs text-gray-400 md:hidden uppercase font-bold mb-1">
                            Total
                          </div>
                          <div className="w-full h-11 px-3 py-2 text-sm border border-slate-200 rounded-md text-right bg-slate-50 font-bold text-gray-900 flex items-center justify-end">
                            {item.amount.toFixed(2)}
                          </div>
                        </div>

                        <div className="md:col-span-1 flex items-center justify-end h-11">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                              title="Remove line"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-50">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={addNewRow}
                    disabled={!hasCustomer}
                  >
                    Add New Row
                  </Button>
                </div>
              </div>

              <div className="space-y-4 my-6">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mt-4">
                  Notes
                </label>
                <div className="bg-white rounded-md border border-gray-200 mt-4 overflow-hidden focus-within:border-primary/50 transition-colors duration-200">
                  <style>{`
                    .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f3f4f6 !important; background: #e5e7eb; padding: 12px 20px; }
                    .ql-container.ql-snow { border: none !important; font-size: 0.9375rem; color: #1f2937; }
                    .ql-editor { min-height: 180px; padding: 10px; line-height: 1.6; }
                    .ql-editor.ql-blank::before { left: 10px; right: 10px; color: #9ca3af; font-style: normal; opacity: 0.7; }
                  `}</style>
                  <ReactQuill
                    theme="snow"
                    value={invoiceData.notes}
                    onChange={(value: string) =>
                      handleInvoiceChange("notes", value)
                    }
                    placeholder="Payment details, special terms, or a thank you message..."
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, false] }],
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "clean"],
                      ],
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 space-y-3">
              <div className="flex justify-end items-center">
                <div className="flex items-center gap-4 w-full max-w-sm justify-between">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </span>
                  <span className="text-base font-bold text-gray-900 w-32 text-right">
                    {calculateSubtotal().toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-end items-center">
                <div className="flex items-center gap-4 w-full max-w-sm justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Discount
                    </span>
                    <div className="relative flex items-center">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={invoiceData.discountPercent}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            if (
                              val === "" ||
                              (Number(val) >= 0 && Number(val) <= 100)
                            ) {
                              handleInvoiceChange(
                                "discountPercent",
                                val === "." ? "0." : val,
                              );
                            }
                          }
                        }}
                        inputSize="sm"
                        fullWidth={false}
                        className="w-20 pr-7 font-bold text-right"
                      />
                      <span className="absolute right-2.5 text-gray-400 text-[10px] font-bold">
                        %
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-bold text-red-500 w-32 text-right">
                    -{" "}
                    {(
                      (calculateSubtotal() *
                        (Number(invoiceData.discountPercent) || 0)) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              {getPreviousRemainingBase() > 0 && (
                <div className="flex justify-end items-center">
                  <div className="flex items-center gap-4 w-full max-w-sm justify-between">
                    <Checkbox
                      label="Previous Remaining"
                      checked={includePreviousRemaining}
                      onChange={(e) =>
                        setIncludePreviousRemaining(e.target.checked)
                      }
                    />
                    <span className="text-base font-bold text-gray-900 w-32 text-right">
                      {getPreviousRemainingBase().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-end items-center pt-4 border-t border-gray-100 mt-2">
                <div className="flex items-center gap-4 w-full max-w-sm justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                      Total ({invoiceData.currency})
                    </span>
                  </div>
                  <span className="text-xl font-black text-primary w-40 text-right tracking-tighter">
                    {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 px-4 flex justify-start gap-3 z-10">
          <Button
            type="button"
            onClick={handleCancel}
            variant="ghost"
            size="md"
            disabled={busy}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSaveDraft}
            variant="secondary"
            size="md"
            disabled={busy || !isFormValid}
            loading={saving || updating}
          >
            {saving || updating ? "Saving..." : "Save as Draft"}
          </Button>

          <Button
            type="button"
            onClick={handlePreview}
            variant="primary"
            size="md"
            disabled={busy || !isFormValid}
            icon={<Eye className="w-4 h-4" />}
          >
            Preview
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
