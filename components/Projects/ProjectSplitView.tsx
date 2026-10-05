"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AlertModal, Button, ConfirmDialog } from "@/components/ui";
import SplitView from "@/components/ui/SplitView";
import ImportMenuItem from "@/components/import/ImportMenuItem";
import ProjectDetails from "./ProjectDetails";
import useProjectList from "@/hooks/projects/useProjectList";
import { PROJECT_STATUSES } from "@/types/project";
import { customerLabel } from "@/lib/format";

const FILTERS = ["All", ...PROJECT_STATUSES].map((s) => ({
  value: s,
  label: s === "All" ? "All Projects" : `${s} Projects`,
}));

const ProjectSplitView = () => {
  const selectedId = useParams<{ id?: string }>()?.id;
  const list = useProjectList();

  return (
    <>
      <ConfirmDialog
        isOpen={list.confirmDialog.show}
        title="Delete Projects"
        message={`Are you sure you want to delete ${list.confirmDialog.selectedIds.length} project(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={list.confirmDelete}
        onCancel={list.hideConfirmDialog}
      />
      <SplitView
        filter={{ value: list.statusFilter, options: FILTERS, onChange: list.setStatusFilter }}
        rows={list.projects.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: customerLabel(p.customer),
          right: p.status,
          muted: p.status === "Completed",
        }))}
        loading={list.initialLoading}
        selectedId={selectedId}
        onOpen={(id) => {
          const p = list.projects.find((x) => String(x.id) === String(id));
          if (p) list.handleRowClick(p);
        }}
        onNew={list.handleNew}
        newLabel="New project"
        menu={(close) => <ImportMenuItem kind="projects" label="Import projects" closeMenu={close} />}
        selectedIds={list.selectedIds}
        onSelectRow={list.onSelectRow}
        emptyText="No projects found"
        detailKey={selectedId}
        bulk={
          <Button size="xs" variant="danger" onClick={() => list.handleDelete()} disabled={list.loading}>
            Delete
          </Button>
        }
      >
        <ProjectDetails />
      </SplitView>
    </>
  );
};

export default ProjectSplitView;
