"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useTemplatesList from "./useTemplatesList";
import useTemplateActions from "./useTemplateActions";
import useTemplatePreview from "./useTemplatePreview";
import useCloneTemplate from "./useCloneTemplate";
import type {
  TemplateListProps,
  UseTemplateListPageReturn,
} from "@/types/template";

const useTemplateListPage = ({
  initialTemplates,
}: TemplateListProps): UseTemplateListPageReturn => {
  const router = useRouter();
  const { loading, error, refetch, filteredTemplates } =
    useTemplatesList(initialTemplates);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    handleDelete,
    handleEdit,
    handleSetDefault,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
  } = useTemplateActions({ selectedIds, setSelectedIds, refetch });

  const {
    isOpen: previewOpen,
    selectedTemplate: previewTemplate,
    zoomLevel,
    currentPage,
    openPreview,
    closePreview,
    zoomIn,
    zoomOut,
    setCurrentPage,
  } = useTemplatePreview();

  const { cloneTemplate } = useCloneTemplate(refetch);

  const handleDeleteFromCard = (id: string) => {
    setSelectedIds([id]);
    handleDelete([id]);
  };

  const handleNew = () => {
    router.push("/templates/new");
  };

  return {
    loading,
    error,
    refetch,
    filteredTemplates,
    handleEdit,
    handleSetDefault,
    handleDeleteFromCard,
    confirmDialog,
    confirmDelete,
    hideConfirmDialog,
    previewOpen,
    previewTemplate,
    zoomLevel,
    currentPage,
    openPreview,
    closePreview,
    zoomIn,
    zoomOut,
    setCurrentPage,
    cloneTemplate,
    handleNew,
  };
};

export default useTemplateListPage;
