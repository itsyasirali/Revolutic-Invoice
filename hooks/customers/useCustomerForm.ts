"use client";

import { useState, useCallback } from "react";
import axios from "@/lib/axios";
import { invalidateCustomers } from "@/lib/swr";
import type { Customer, MaybeFile } from "@/types/customer";
import { useAlert } from "./useAlert";
import { toast } from "@/components/ui";

export const useCustomerForm = (initialCustomer?: Customer | null) => {
  const [customerType, setCustomerType] = useState<string>(() => {
    return initialCustomer?.customerType || "Business";
  });

  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<MaybeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, dismissAlert } = useAlert();

  // Newly chosen files are appended to the current selection (an <input
  // type="file"> would otherwise replace it on every pick).
  const handleFileChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    // Copy now: the FileList is live and is emptied when the input is reset.
    const picked = Array.from(fileList);
    setFiles((prev) => [...prev, ...picked]);
  };

  const removeSelectedFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(
    async (
      e: React.FormEvent<HTMLFormElement> | Event,
      customer?: { id?: string | number },
      currentExistingFiles: MaybeFile[] = [],
    ): Promise<boolean> => {
      e.preventDefault();
      let success = false;
      setLoading(true);
      dismissAlert();

      try {
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);

        formData.set("customerType", customerType);
        formData.set("displayName", formData.get("displayName") as string);
        formData.set("companyName", formData.get("companyName") as string);
        formData.set("address", formData.get("address") as string);
        formData.set("remarks", formData.get("remarks") as string);
        formData.set("status", (formData.get("status") as string) || "Active");

        const contacts = formData.get("contacts");
        if (contacts) {
          formData.set("contacts", contacts as string);
        }

        // Client-side validation: require at least one contact with an
        // email or phone number, mirroring the server-side check in
        // utils/customers/customersHelper.ts (validateContacts).
        let parsedContacts: Array<{ email?: string; contact?: string }> = [];
        try {
          parsedContacts = contacts ? JSON.parse(contacts as string) : [];
        } catch {
          parsedContacts = [];
        }
        const contactError = (() => {
          if (parsedContacts.length === 0) {
            return "Please add at least one contact with an email address.";
          }
          for (let i = 0; i < parsedContacts.length; i += 1) {
            const c = parsedContacts[i];
            if (!c) continue;
            if (!c.email || !c.email.trim()) {
              const prefix =
                parsedContacts.length > 1 ? `Contact ${i + 1} – ` : "";
              return `${prefix}Please enter an email address.`;
            }
          }
          return null;
        })();
        if (contactError) {
          showAlert("error", contactError);
          setLoading(false);
          return false;
        }

        if (customer && customer.id) {
          const existingDocsPayload = currentExistingFiles.map((f) => {
            if (!f) return "";
            if (typeof f === "string") return f;
            const fileObj = f as { url?: string; name?: string; path?: string };
            if (fileObj.url) return fileObj.url;
            if (fileObj.path) return fileObj.path;
            if (fileObj.name) return fileObj.name;
            return String(f);
          });
          formData.set("existingDocuments", JSON.stringify(existingDocsPayload));
        }

        // Delete any empty/dummy File entry captured from the DOM file input
        formData.delete("documents");
        if (files.length > 0) {
          files.forEach((file) => {
            if (file && file.size > 0 && file.name) {
              formData.append("documents", file);
            }
          });
        }

        const url =
          customer && customer.id
            ? `/customers/${customer.id}`
            : `/customers`;

        const method = customer && customer.id ? "put" : "post";

        const response = await axios({
          method,
          url,
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 200 || response.status === 201) {
          await invalidateCustomers();
          const isEdit = Boolean(customer && customer.id);
          toast.success(
            isEdit
              ? "Customer updated successfully"
              : "Customer created successfully",
            isEdit ? "Customer Updated" : "Customer Created"
          );
        }

        setFiles([]);
        success = response.status === 200 || response.status === 201;
      } catch (err: unknown) {
        console.error("Error saving customer:", err);
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const msg =
          error.response?.data?.message || error.message || "Failed to save customer";
        showAlert("error", msg);
      } finally {
        setLoading(false);
      }
      return success;
    },
    [customerType, files, showAlert, dismissAlert],
  );

  return {
    customerType,
    setCustomerType,
    files,
    handleFileChange,
    removeSelectedFile,
    handleSubmit,
    loading,
    existingFiles,
    setExistingFiles,
    alert,
    dismissAlert,
  };
};

export default useCustomerForm;
