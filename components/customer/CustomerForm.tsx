"use client";

import React from "react";
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
import { resolveFileUrl } from "@/lib/fileUrl";
import ContactsSection from "./ContactsSection";
import useCustomerFormView from "@/hooks/customers/useCustomerFormView";

const CustomerForm: React.FC = () => {
  const {
    customer,
    loading,
    saving,
    customerType,
    setCustomerType,
    handleFileChange,
    existingFiles,
    handleRemoveExistingFile,
    handleFormSubmit,
    handleCancel,
    alert,
    dismissAlert,
  } = useCustomerFormView();

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
                <Tooltip content="Choose Business if this customer is a company, or Individual for a single person. This determines whether Company Name applies.">
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
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
                <Tooltip content="Attach relevant PDF documents for this customer, such as contracts or ID proof.">
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </label>
              {existingFiles.length > 0 && (
                <ul className="mb-4 space-y-2">
                  {existingFiles.map((doc: MaybeFile, index: number) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100"
                    >
                      <a
                        href={resolveFileUrl(
                          typeof doc === "object" &&
                            doc !== null &&
                            "url" in doc &&
                            doc.url
                            ? String(doc.url)
                            : String(doc),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex-1 truncate"
                      >
                        {typeof doc === "object" &&
                        doc !== null &&
                        "name" in doc &&
                        doc.name
                          ? doc.name
                          : String(doc).split("/").pop()}
                      </a>

                      <button
                        type="button"
                        onClick={() => handleRemoveExistingFile(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors ml-2 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="relative">
                <input
                  type="file"
                  name="documents"
                  multiple
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-primary/5 file:text-primary hover:file:bg-primary/10 transition-all cursor-pointer"
                />
              </div>
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
