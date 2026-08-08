"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import useTemplatesList from "@/hooks/templates/useTemplatesList";
import useTemplateActions from "@/hooks/templates/useTemplateActions";
import useTemplatePreview from "@/hooks/templates/useTemplatePreview";
import useCloneTemplate from "@/hooks/templates/useCloneTemplate";
import { Button, ConfirmDialog, EmptyState, PageHeader } from "@/components/ui";
import TemplateCard from "./TemplateCard";
import TemplatePreviewModal from "./TemplatePreviewModal";

const TemplateList: React.FC = () => {
  const router = useRouter();
  const { loading, error, refetch, filteredTemplates } = useTemplatesList();
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

  if (error) {
    return (
      <div className="bg-white p-6">
        <div className="p-6 bg-red-50 text-red-700 rounded-md border border-red-200 max-w-xl mx-auto text-center">
          <h3 className="text-base font-bold mb-1">Failed to load templates</h3>
          <p className="text-xs mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        title="PDF Templates"
        actions={
          <Button
            onClick={handleNew}
            disabled={loading}
            variant="primary"
            size="md"
          >
            New Template
          </Button>
        }
      />

      <div className="p-6">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                onEdit={(id) => handleEdit(id, template.raw || template)}
                onSetActive={handleSetDefault}
                onPreview={openPreview}
                onClone={cloneTemplate}
                onDelete={handleDeleteFromCard}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No PDF templates found"
            message="Get started by creating your first custom PDF template layout."
            action={{
              label: "Create First Template",
              onClick: handleNew,
            }}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.show}
        onCancel={hideConfirmDialog}
        onConfirm={confirmDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <TemplatePreviewModal
        isOpen={previewOpen}
        template={previewTemplate}
        zoomLevel={zoomLevel}
        currentPage={currentPage}
        totalPages={2}
        onClose={closePreview}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default TemplateList;
