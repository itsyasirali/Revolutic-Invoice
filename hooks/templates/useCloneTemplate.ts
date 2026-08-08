"use client";

import { useState, useCallback } from "react";
import axios from "@/lib/axios";
import type { TemplateListItem, AlertState } from "@/types/template";

export interface UseCloneTemplateReturn {
  cloneTemplate: (template: TemplateListItem) => Promise<void>;
  loading: boolean;
  alert: AlertState;
  dismissAlert: () => void;
}

const useCloneTemplate = (
  onSuccess?: () => Promise<void>
): UseCloneTemplateReturn => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });

  const cloneTemplate = useCallback(
    async (template: TemplateListItem) => {
      try {
        setLoading(true);
        const templateData = template.raw;

        const clonePayload = {
          ...templateData,
          templateName: `${templateData.templateName} (Copy)`,
          isDefault: false,
        };

        delete (clonePayload as any).id;
        delete (clonePayload as any).userId;
        delete (clonePayload as any).createdAt;
        delete (clonePayload as any).updatedAt;

        await axios.post(`/templates`, clonePayload);

        setAlert({
          show: true,
          type: "success",
          message: `Template "${template.name}" cloned successfully`,
        });

        if (onSuccess) {
          await onSuccess();
        }
      } catch (err: any) {
        console.error("Error cloning template:", err);
        setAlert({
          show: true,
          type: "error",
          message: err.response?.data?.message || "Failed to clone template",
        });
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const dismissAlert = useCallback(() => {
    setAlert({ show: false, type: "info", message: "" });
  }, []);

  return {
    cloneTemplate,
    loading,
    alert,
    dismissAlert,
  };
};

export default useCloneTemplate;
