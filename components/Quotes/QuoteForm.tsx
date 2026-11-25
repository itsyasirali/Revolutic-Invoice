"use client";

import React from "react";
import { Info, Settings, X } from "lucide-react";
import {
  Input,
  Select,
  Textarea,
  Button,
  Checkbox,
  AlertModal,
  PageHeader,
  LoadingSpinner,
  Tooltip,
} from "@/components/ui";
import useQuoteForm from "@/hooks/quotes/useQuoteForm";
import { formatMoney } from "@/lib/format";
import type { InvoiceCustomer } from "@/types/invoice";

const sectionTitle = "text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2";
const readOnlyCls = "bg-gray-50/50";

/** Plain-text numeric input (no spinner arrows): accepts only digits and a single dot. */
const onDecimalChange =
  (apply: (value: string) => void, max?: number) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      if (max !== undefined && val !== "" && val !== "." && Number(val) > max) return;
      apply(val === "." ? "0." : val);
    }
  };

/** Same, but allows a leading minus (adjustment can reduce the total). */
const onSignedDecimalChange =
  (apply: (value: string) => void) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
      apply(val);
    }
  };

const QuoteForm: React.FC = () => {
  const f = useQuoteForm();
  const quote = f.quote;

  if (f.isEdit && f.loading && !quote) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  const lineAmounts = f.totals.items.map((i) => i.amount);
  const currencyCode = f.currency || quote?.currency || "PKR";
  const hasCustomer = !!f.customerId;
  const customer = f.selectedCustomer as InvoiceCustomer | undefined;
  const contact = customer?.contacts?.[0];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader title={f.isEdit ? `Edit ${quote?.quoteNumber || "Quote"}` : "New Quote"} onBack={f.handleCancel} />

      <AlertModal
        isOpen={f.alert.show}
        type={f.alert.type}
        message={f.alert.message}
        onClose={f.dismissAlert}
      />

      <form
        key={quote ? `quote-${quote.id}` : "new"}
        ref={f.formRef}
        onSubmit={f.handleSubmit}
        className="flex-1 flex flex-col"
      >
        <div className="flex-1 py-8 px-4">
          <div className="flex flex-col gap-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer details */}
              <div className="space-y-4">
                <label className={sectionTitle}>
                  Customer Details
                  <span className="normal-case font-normal tracking-normal text-sm">
                    <Tooltip content="Choose the customer this quote is for. Their email, phone and address are filled in automatically.">
                      <Info className="w-4 h-4 text-gray-400" />
                    </Tooltip>
                  </span>
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    label="Customer"
                    placeholder="Select a customer"
                    options={f.customerOptions}
                    value={f.customerId}
                    onValueChange={f.setCustomerId}
                    searchable
                    searchPlaceholder="Search customers..."
                    fullWidth
                  />
                  <Input
                    label="Email"
                    value={contact?.email || ""}
                    placeholder="Customer Email"
                    readOnly
                    fullWidth
                    className={readOnlyCls}
                  />
                  <Input
                    label="Phone"
                    value={contact?.contact || ""}
                    placeholder="Customer Phone"
                    readOnly
                    fullWidth
                    className={readOnlyCls}
                  />
                  <Input
                    label="Address"
                    value={customer?.address || ""}
                    placeholder="Customer Address"
                    readOnly
                    fullWidth
                    className={readOnlyCls}
                  />
                </div>
              </div>

              {/* Quote details */}
              <div className="space-y-4">
                <label className={sectionTitle}>
                  Quote Details
                  <span className="normal-case font-normal tracking-normal text-sm">
                    <Tooltip content="Set the dates, reference, currency and template for this quote.">
                      <Settings className="w-4 h-4 text-gray-400" />
                    </Tooltip>
                  </span>
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <Input
                      label="Quote Number"
                      value={
                        f.isEdit
                          ? quote?.quoteNumber || ""
                          : f.customNumbering
                            ? f.quoteNumber
                            : ""
                      }
                      placeholder={f.isEdit || !f.customNumbering ? "Auto-generated" : "e.g. CustomerName-1"}
                      onChange={(e) => f.setQuoteNumber(e.target.value)}
                      readOnly={!f.customNumbering || f.isEdit}
                      disabled={!f.customNumbering || f.isEdit}
                      fullWidth
                      className={!f.customNumbering || f.isEdit ? `${readOnlyCls} text-gray-400` : ""}
                    />
                    {!f.isEdit && (
                      <label className="absolute right-0 -top-0.5 flex h-4 items-center gap-1.5 text-xs leading-none text-gray-500 cursor-pointer select-none [&_div]:mt-0">
                        <Checkbox
                          checkboxSize="sm"
                          checked={f.customNumbering}
                          onChange={f.toggleCustomNumbering}
                        />
                        Use Custom
                      </label>
                    )}
                  </div>
                  <Input
                    type="text"
                    name="referenceNumber"
                    label="Reference Number"
                    defaultValue={quote?.referenceNumber || ""}
                    fullWidth
                  />
                  <Input
                    type="date"
                    name="quoteDate"
                    label="Quote Date"
                    defaultValue={f.defaultQuoteDate || new Date().toISOString().slice(0, 10)}
                    required
                    fullWidth
                  />
                  <Input
                    type="date"
                    name="expiryDate"
                    label="Expiry Date"
                    defaultValue={f.defaultExpiryDate}
                    fullWidth
                  />
                </div>
              </div>
            </div>

            {/* Item details */}
            <div className="space-y-4">
              <label className={sectionTitle}>Item Details</label>

              <div className="bg-white border border-gray-100">
                <div className="bg-gray-200 px-6 py-4 border-b border-gray-100 hidden md:block">
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="col-span-4">Item Details</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-1 text-right">Disc %</div>
                    <div className="col-span-1 text-right">Tax %</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                </div>

                <div className="bg-gray-50">
                  {f.lines.map((line, index) => (
                    <div key={line.key} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        <div className="md:col-span-4 space-y-3">
                          <Select
                            showLabel={false}
                            placeholder={hasCustomer ? "Select an item" : "Select a customer first"}
                            options={f.itemOptions}
                            value={line.itemId}
                            onValueChange={(v) => f.pickItem(line.key, v)}
                            disabled={!hasCustomer}
                            searchable
                            searchPlaceholder="Search items..."
                            fullWidth
                          />
                          <Textarea
                            rows={2}
                            placeholder="Item description (optional)"
                            value={line.description}
                            onChange={(e) => f.updateLine(line.key, { description: e.target.value })}
                            disabled={!hasCustomer}
                            fullWidth
                          />
                        </div>

                        <div className="md:col-span-1">
                          <div className="md:hidden mb-1 font-bold text-xs text-gray-500">QTY</div>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={line.quantity}
                            onChange={onDecimalChange((v) => f.updateLine(line.key, { quantity: v }))}
                            disabled={!hasCustomer}
                            fullWidth
                            className="text-center"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="md:hidden mb-1 font-bold text-xs text-gray-500">RATE</div>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={line.rate}
                            onChange={onDecimalChange((v) => f.updateLine(line.key, { rate: v }))}
                            disabled={!hasCustomer}
                            fullWidth
                            className="text-right"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <div className="md:hidden mb-1 font-bold text-xs text-gray-500">DISC %</div>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={line.discount}
                            onChange={onDecimalChange((v) => f.updateLine(line.key, { discount: v }), 100)}
                            disabled={!hasCustomer}
                            fullWidth
                            className="text-right"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <div className="md:hidden mb-1 font-bold text-xs text-gray-500">TAX %</div>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={line.tax}
                            onChange={onDecimalChange((v) => f.updateLine(line.key, { tax: v }))}
                            disabled={!hasCustomer}
                            fullWidth
                            className="text-right"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="md:hidden mb-1 font-bold text-xs text-gray-500 uppercase">Amount</div>
                          <div className="w-full h-11 px-3 py-2 text-sm border border-slate-200 rounded-md text-right bg-slate-50 font-bold text-gray-900 flex items-center justify-end">
                            {(lineAmounts[index] ?? 0).toFixed(2)}
                          </div>
                        </div>

                        <div className="md:col-span-1 flex items-center justify-end h-11">
                          {f.lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => f.removeLine(line.key)}
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
                  <Button type="button" variant="primary" size="md" onClick={f.addLine} disabled={!hasCustomer}>
                    Add New Row
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes + Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className={sectionTitle}>Notes</label>
                <Textarea
                  name="notes"
                  placeholder="Payment details, special terms, or a thank you message..."
                  defaultValue={quote?.notes || "Looking forward for your business."}
                  rows={5}
                  fullWidth
                />
              </div>

              <div className="space-y-4">
                <label className={sectionTitle}>Terms &amp; Conditions</label>
                <Textarea
                  name="terms"
                  placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                  defaultValue={quote?.terms || ""}
                  rows={5}
                  fullWidth
                />
              </div>
            </div>

            {/* Totals */}
            <div className="p-8 flex justify-end">
              <div className="w-full max-w-sm space-y-3">
                <div className="grid grid-cols-[1fr_6rem_8rem] items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
                  <span />
                  <span className="text-base font-bold text-gray-900 text-right">
                    {formatMoney(f.totals.subTotal)}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_6rem_8rem] items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Discount</span>
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={f.discountPercent}
                      onChange={onDecimalChange(f.setDiscountPercent, 100)}
                      inputSize="sm"
                      fullWidth
                      className="pr-7 font-bold text-right"
                    />
                    <span className="absolute right-2.5 text-gray-400 text-[10px] font-bold">%</span>
                  </div>
                  <span className="text-base font-bold text-red-500 text-right">
                    - {formatMoney(f.totals.discount)}
                  </span>
                </div>
                {f.showShipping && (
                  <div className="grid grid-cols-[1fr_6rem_8rem] items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Shipping</span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={f.shipping}
                      onChange={onDecimalChange(f.setShipping)}
                      inputSize="sm"
                      fullWidth
                      className="font-bold text-right"
                    />
                    <span className="text-base font-bold text-gray-900 text-right">
                      {formatMoney(f.totals.shipping)}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-[1fr_6rem_8rem] items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Adjustment</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={f.adjustment}
                    onChange={onSignedDecimalChange(f.setAdjustment)}
                    inputSize="sm"
                    fullWidth
                    className="font-bold text-right"
                  />
                  <span className="text-base font-bold text-gray-900 text-right">
                    {formatMoney(f.totals.adjustment)}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_6rem_8rem] items-center gap-3 pt-4 border-t border-gray-100 mt-2">
                  <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                    Total ({currencyCode})
                  </span>
                  <span />
                  <span className="text-xl font-black text-primary text-right tracking-tighter">
                    {formatMoney(f.totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 px-4 flex justify-start gap-3 z-10">
          <Button type="button" variant="ghost" size="md" onClick={f.handleCancel} disabled={f.saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            size="md"
            loading={f.saving && !f.sendingAfterSave}
            disabled={f.saving}
          >
            {f.saving && !f.sendingAfterSave ? "Saving..." : f.isEdit ? "Update Quote" : "Save Quote"}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={f.handleSaveAndSend}
            loading={f.sendingAfterSave}
            disabled={f.saving}
          >
            {f.sendingAfterSave ? "Saving..." : "Save and Send"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;
