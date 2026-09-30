"use client";

import React, { useRef } from "react";
import { Info, X } from "lucide-react";
import currenciesData from "@/data/CurrencyData";
import type { MaybeFile } from "@/types/customer";
import {
  Input,
  Select,
  Textarea,
  Button,
  AlertModal,
  PageHeader,
  LoadingSpinner,
  Tooltip,
} from "@/components/ui";
import { resolveFileUrl, getFileNameFromUrl } from "@/lib/fileUrl";
import ContactsSection from "./ContactsSection";
import useCustomerFormView from "@/hooks/customers/useCustomerFormView";

const PdfIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    role="img"
    aria-label="PDF document"
  >
    <path
      d="M10 4h20l10 10v28a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
      fill="#fff"
      stroke="#DC2626"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M30 4v10h10" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" strokeLinejoin="round" />
    <rect x="4" y="22" width="30" height="14" rx="2" fill="#DC2626" />
    <text
      x="19"
      y="32.5"
      textAnchor="middle"
      fontSize="9"
      fontWeight="700"
      fontFamily="Arial, Helvetica, sans-serif"
      fill="#fff"
    >
      PDF
    </text>
  </svg>
);

const CustomerForm: React.FC = () => {
  const {
    customer,
    loading,
    saving,
    customerType,
    setCustomerType,
    selectedFiles,
    handleFileChange,
    removeSelectedFile,
    existingFiles,
    handleRemoveExistingFile,
    handleFormSubmit,
    handleCancel,
    alert,
    dismissAlert,
  } = useCustomerFormView();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openSelectedFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const formatSize = (bytes: number) =>
    bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHeader
        title={customer ? "Update Customer" : "New Customer"}
        onBack={handleCancel}
      />

      <AlertModal
        isOpen={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={dismissAlert}
      />

      <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 py-8 px-4">
          <div className="flex flex-col gap-y-6">
            {/* Customer Type */}
            <div>
              <label className="text-base font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                Customer Type
                <span className="normal-case font-normal tracking-normal text-sm">
                  <Tooltip content="Choose Business if this customer is a company, or Individual for a single person. This determines whether Company Name applies.">
                    <Info className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                </span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="customerType"
                    value="Business"
                    checked={customerType === "Business"}
                    onChange={() => setCustomerType("Business")}
                    className="w-5 h-5 text-primary border-gray-300 focus:ring-primary/20"
                  />
                  <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    Business
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="customerType"
                    value="Individual"
                    checked={customerType === "Individual"}
                    onChange={() => setCustomerType("Individual")}
                    className="w-5 h-5 text-primary border-gray-300 focus:ring-primary/20"
                  />
                  <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    Individual
                  </span>
                </label>
              </div>
            </div>

            <Input
              type="text"
              name="displayName"
              label="Display Name"
              placeholder="Enter display name"
              defaultValue={customer?.displayName || ""}
              required
              fullWidth
            />

            {customerType === "Business" ? (
              <Input
                type="text"
                name="companyName"
                label="Company Name"
                placeholder="Enter company name"
                defaultValue={customer?.companyName || ""}
                fullWidth
              />
            ) : (
              // Individual customers have no company; submit an empty value
              // so the field is explicitly cleared server-side on update.
              <input type="hidden" name="companyName" value="" readOnly />
            )}

            <Select
              name="currency"
              label="Currency"
              defaultValue={customer?.currency || "PKR"}
              fullWidth
              options={currenciesData.map((cur) => ({
                label: `${cur.code} - ${cur.name}`,
                value: cur.code,
              }))}
            />

            <Textarea
              name="address"
              label="Address"
              rows={4}
              defaultValue={customer?.address || ""}
              placeholder="Enter complete billing address"
              fullWidth
            />

            <Textarea
              name="remarks"
              label="Remarks (Internal)"
              rows={4}
              defaultValue={customer?.remarks || ""}
              placeholder="Enter internal notes about this customer"
              fullWidth
            />

            {/* Documents Section */}
            <div>
              <label className="text-base font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                Documents
                {/* Reset the label's uppercase/bold styling so the tooltip text
                    matches the other tooltips on this screen. */}
                <span className="normal-case font-normal tracking-normal text-sm">
                  <Tooltip content="Attach relevant PDF documents for this customer, such as contracts or ID proof.">
                    <Info className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                </span>
              </label>
              {(existingFiles.length > 0 || selectedFiles.length > 0) && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {existingFiles.map((doc: MaybeFile, index: number) => {
                    const name =
                      typeof doc === "object" && doc !== null && doc.name
                        ? doc.name
                        : getFileNameFromUrl(
                            String(
                              typeof doc === "object" && doc !== null
                                ? doc.url || doc.path || ""
                                : doc,
                            ),
                          );
                    const href = resolveFileUrl(
                      typeof doc === "object" && doc !== null && doc.url
                        ? String(doc.url)
                        : String(doc),
                    );
                    return (
                      <div
                        key={`existing-${index}`}
                        className="relative group w-36 rounded-md border border-gray-200 bg-white p-3 hover:border-primary hover:shadow-sm transition"
                      >
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={name}
                          className="flex flex-col items-center gap-2 text-center"
                        >
                          <PdfIcon className="w-11 h-11" />
                          <span className="w-full truncate text-xs font-medium text-gray-700">
                            {name}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            PDF
                          </span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingFile(index)}
                          aria-label={`Remove ${name}`}
                          className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {selectedFiles.map((file: File, index: number) => (
                    <div
                      key={`selected-${file.name}-${index}`}
                      className="relative group w-36 rounded-md border border-gray-200 bg-white p-3 hover:border-primary hover:shadow-sm transition"
                    >
                      <button
                        type="button"
                        onClick={() => openSelectedFile(file)}
                        title={file.name}
                        className="flex w-full flex-col items-center gap-2 text-center cursor-pointer"
                      >
                        <PdfIcon className="w-11 h-11" />
                        <span className="w-full truncate text-xs font-medium text-gray-700">
                          {file.name}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          PDF · {formatSize(file.size)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        aria-label={`Remove ${file.name}`}
                        className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  handleFileChange(e.target.files);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Files
              </Button>
            </div>

            {/* Contacts Section */}
            <div className="pt-4 border-t border-gray-100">
              <ContactsSection initial={customer?.contacts} />
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-4 flex justify-start gap-3 z-10">
          <Button
            type="button"
            onClick={handleCancel}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            size="md"
            loading={saving}
          >
            {customer ? "Update Customer" : "Create Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
