"use client";

import { useRouter } from "next/navigation";
import useDeleteTemplates from "./useDeleteTemplates";
import useSetDefaultTemplate from "./useSetDefaultTemplate";
import type {
  UseTemplateActionsProps,
  UseTemplateActionsReturn,
} from "@/types/template";
import { setNavState } from "@/lib/clientNavState";

const useTemplateActions = ({
  selectedIds,
  setSelectedIds,
  refetch,
}: UseTemplateActionsProps): UseTemplateActionsReturn => {
  const router = useRouter();
  const {
    deleteTemplates,
    confirmDialog,
    confirmDelete: executeDelete,
    hideConfirmDialog,
  } = useDeleteTemplates();
  const { setDefaultTemplate } = useSetDefaultTemplate();

  const handleDelete = (ids?: string[]) => {
    const targets = ids || selectedIds;
    if (targets.length === 0) return;
    deleteTemplates(targets);
  };

  const confirmDelete = async () => {
    await executeDelete();
    setSelectedIds([]);
    await refetch();
    hideConfirmDialog();
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultTemplate(id);
    await refetch();
  };

  const handleEdit = (id: string, template?: any) => {
    if (template) {
      setNavState(`template:${id}`, template);
    }
    router.push(`/templates/edit/${id}`);
  };

  const handlePreview = (id: string) => {
    router.push(`/templates/${id}`);
  };

  return {
    handleDelete,
    handleSetDefault,
    handleEdit,
    handlePreview,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
  };
};

export default useTemplateActions;
