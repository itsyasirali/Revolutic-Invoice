"use client";

import React from "react";
import { FileText, Plus } from "lucide-react";
import useTemplateListPage from "@/hooks/templates/useTemplateListPage";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  LoadingSpinner,
} from "@/components/ui";
import TemplateCard from "./TemplateCard";
import TemplatePreviewModal from "./TemplatePreviewModal";
import type { TemplateListProps } from "@/types/template";

const TemplateList = ({ initialTemplates }: TemplateListProps) => {
  const {
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
  } = useTemplateListPage({ initialTemplates });

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
    <div className="pb-8">
      <PageHeader title="PDF Templates" />

      <div className="px-2 sm:px-4 md:px-6 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <LoadingSpinner size="lg" color="primary" />
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid gap-x-6 gap-y-8 justify-start" style={{ gridTemplateColumns: "repeat(auto-fill, calc(210mm * 0.45))" }}>
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

            {/* "New Template" tile, same size as a template card */}
            <div
              className="flex flex-col justify-center rounded-md border border-dashed border-slate-300 bg-white px-6"
              style={{ width: "calc(210mm * 0.45)", height: "calc(297mm * 0.45)" }}
            >
              <h3 className="text-xl font-medium text-slate-900 mb-3">New Template</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-5">
                Click to add a template. You can customize the template title,
                columns, headers and bank details.
              </p>
              <div>
                <Button onClick={handleNew} variant="primary" size="sm" icon={<Plus size={16} />} iconPosition="left">
                  New
                </Button>
              </div>
            </div>
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
