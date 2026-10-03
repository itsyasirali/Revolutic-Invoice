"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Input,
  Select,
  Textarea,
  Button,
  AlertModal,
  PageHeader,
  LoadingSpinner,
} from "@/components/ui";
import useQuoteForm from "@/hooks/quotes/useQuoteForm";
import currencies from "@/data/CurrencyData";
import { formatMoney } from "@/lib/format";

const currencyOptions = currencies.map((c) => ({
  label: `${c.code} - ${c.name}`,
  value: c.code,
}));

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
        onSubmit={f.handleSubmit}
        className="flex-1 flex flex-col"
      >
        <div className="flex-1 py-8 px-4">
          <div className="flex flex-col gap-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Customer"
                placeholder="Select customer"
                options={f.customerOptions}
                value={f.customerId}
                onValueChange={f.setCustomerId}
                fullWidth
              />
              <Select
                label="Template"
                placeholder="Default template"
                options={f.templateOptions}
                value={f.templateId}
                onValueChange={f.setTemplateId}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Input
                type="text"
                name="referenceNumber"
                label="Reference Number"
                defaultValue={quote?.referenceNumber || ""}
                fullWidth
              />
              <Select
                label="Currency"
                options={currencyOptions}
                value={f.currency || quote?.currency || "PKR"}
                onValueChange={f.setCurrency}
                fullWidth
              />
            </div>

            {/* Items */}
            <div>
              <h2 className="text-base font-bold text-gray-700 uppercase tracking-wider mb-3">Items</h2>
              <div className="space-y-3">
                {f.lines.map((line, index) => (
                  <div
                    key={line.key}
                    className="border border-slate-200 rounded-md p-3 bg-slate-50/40 grid grid-cols-2 md:grid-cols-12 gap-3 items-end"
                  >
                    <div className="col-span-2 md:col-span-3">
                      <Select
                        label="Catalog item"
                        selectSize="sm"
                        placeholder="Pick an item (optional)"
                        options={f.itemOptions}
                        value={line.itemId}
                        onValueChange={(v) => f.pickItem(line.key, v)}
                      />
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <Input
                        label="Name"
                        inputSize="sm"
                        value={line.name}
                        onChange={(e) => f.updateLine(line.key, { name: e.target.value })}
                        required
                        fullWidth
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        label="Qty"
                        type="number"
                        step="0.01"
                        min="0"
                        inputSize="sm"
                        value={line.quantity}
                        onChange={(e) => f.updateLine(line.key, { quantity: e.target.value })}
                        fullWidth
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Rate"
                        type="number"
                        step="0.01"
                        min="0"
                        inputSize="sm"
                        value={line.rate}
                        onChange={(e) => f.updateLine(line.key, { rate: e.target.value })}
                        fullWidth
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        label="Disc %"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        inputSize="sm"
                        value={line.discount}
                        onChange={(e) => f.updateLine(line.key, { discount: e.target.value })}
                        fullWidth
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        label="Tax %"
                        type="number"
                        step="0.01"
                        min="0"
                        inputSize="sm"
                        value={line.tax}
                        onChange={(e) => f.updateLine(line.key, { tax: e.target.value })}
                        fullWidth
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-center justify-between md:justify-end gap-2 pb-2">
                      <span className="text-sm font-bold text-slate-900">
                        {formatMoney(lineAmounts[index] ?? 0)}
                      </span>
                      <button
                        type="button"
                        onClick={() => f.removeLine(line.key)}
                        disabled={f.lines.length === 1}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md cursor-pointer disabled:opacity-40"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="col-span-2 md:col-span-12">
                      <Input
                        label="Description"
                        inputSize="sm"
                        value={line.description}
                        onChange={(e) => f.updateLine(line.key, { description: e.target.value })}
                        fullWidth
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                icon={<Plus className="w-4 h-4" />}
                onClick={f.addLine}
              >
                Add item
              </Button>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 content-start">
                <Input
                  label="Discount %"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={f.discountPercent}
                  onChange={(e) => f.setDiscountPercent(e.target.value)}
                  fullWidth
                />
                <Input
                  label="Shipping"
                  type="number"
                  step="0.01"
                  value={f.shipping}
                  onChange={(e) => f.setShipping(e.target.value)}
                  fullWidth
                />
                <Input
                  label="Adjustment"
                  type="number"
                  step="0.01"
                  value={f.adjustment}
                  onChange={(e) => f.setAdjustment(e.target.value)}
                  fullWidth
                />
              </div>
              <div className="border border-slate-200 rounded-md p-4 text-sm space-y-2 bg-white">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal (incl. line tax)</span><span className="font-semibold">{formatMoney(f.totals.subTotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">of which tax</span><span>{formatMoney(f.totals.tax)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{formatMoney(f.totals.shipping)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Adjustment</span><span>{formatMoney(f.totals.adjustment)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>- {formatMoney(f.totals.discount)}</span></div>
                <div className="flex justify-between border-t pt-2 text-base">
                  <span className="font-bold">Total ({f.currency || quote?.currency || "PKR"})</span>
                  <span className="font-bold">{formatMoney(f.totals.total)}</span>
                </div>
                <p className="text-xs text-slate-400">Preview only. Final amounts are calculated when saved.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textarea name="notes" label="Notes" defaultValue={quote?.notes || ""} rows={4} fullWidth />
              <Textarea
                name="terms"
                label="Terms & Conditions"
                defaultValue={quote?.terms || ""}
                rows={4}
                fullWidth
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 px-4 flex justify-start gap-3 z-10">
          <Button type="button" variant="ghost" size="md" onClick={f.handleCancel} disabled={f.saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={f.saving} disabled={f.saving}>
            {f.isEdit ? "Update Quote" : "Create Quote"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;
