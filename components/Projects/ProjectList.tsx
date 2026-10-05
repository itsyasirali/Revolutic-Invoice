"use client";

import React from "react";
import { useProjectListMenu } from "@/hooks/common/listMenus";
import { Table, StatusBadge, Button, PageHeader, ConfirmDialog } from "@/components/ui";
import useProjectList from "@/hooks/projects/useProjectList";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatMoney } from "@/lib/format";
import { formatDuration } from "@/types/timeEntry";
import { PROJECT_STATUSES, type Project, type ProjectListProps } from "@/types/project";

const STATUS_OPTIONS = ["All", ...PROJECT_STATUSES];

const ProjectList = ({ initialProjects }: ProjectListProps) => {
  const list = useProjectList(initialProjects);
  const listMenu = useProjectListMenu(list.projects);

  const columns = [
    {
      key: "projectNumber",
      label: "PROJECT #",
      render: (p: Project) => <span className="font-bold text-gray-900">{p.projectNumber}</span>,
    },
    {
      key: "name",
      label: "NAME",
      render: (p: Project) => <span className="text-gray-900">{p.name}</span>,
    },
    {
      key: "customer",
      label: "CUSTOMER",
      render: (p: Project) => <span className="text-gray-900">{customerLabel(p.customer)}</span>,
    },
    {
      key: "billingMethod",
      label: "BILLING",
      render: (p: Project) => <span className="text-gray-600">{p.billingMethod}</span>,
    },
    {
      key: "logged",
      label: "LOGGED",
      render: (p: Project) => (
        <span className="text-gray-600">
          {formatDuration(p.stats?.loggedMinutes || 0)}
          {Number(p.budgetHours) > 0 ? ` / ${p.budgetHours}h` : ""}
        </span>
      ),
    },
    {
      key: "unbilled",
      label: "UNBILLED",
      render: (p: Project) => (
        <span className="text-gray-900 font-bold">
          {formatMoney((p.stats?.unbilledTimeAmount || 0) + (p.stats?.unbilledExpenseAmount || 0))}{" "}
          {p.currency}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (p: Project) => <StatusBadge status={p.status} variant={statusVariant(p.status)} />,
    },
  ];

  const selectedCount = list.selectedIds.length;

  return (
    <div className="pb-8">
      <ConfirmDialog
        isOpen={list.confirmDialog.show}
        title="Delete Projects"
        message={`Are you sure you want to delete ${list.confirmDialog.selectedIds.length} project(s)? Logged time and expenses stay, but are no longer linked to a project.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={list.confirmDelete}
        onCancel={list.hideConfirmDialog}
      />

      <PageHeader
        title={list.statusFilter === "All" ? "All Projects" : `${list.statusFilter} Projects`}
        showBackButton={list.statusFilter !== "All"}
        onBack={() => list.setStatusFilter("All")}
        dropdown={{
          options: STATUS_OPTIONS.map((opt) => ({ label: `${opt} Projects`, value: opt })),
          value: list.statusFilter,
          onChange: list.setStatusFilter,
          isOpen: list.dropdownOpen,
          onToggle: () => list.setDropdownOpen(!list.dropdownOpen),
        }}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={list.handleNew} disabled={list.loading} variant="primary" size="sm">
              New Project
            </Button>
          {listMenu.menu}
          </div>
        }
        actionBar={
          selectedCount > 0 ? (
            <>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs">
                  {selectedCount}
                </span>
                project{selectedCount > 1 ? "s" : ""} selected
              </div>
              <Button onClick={() => list.handleDelete()} disabled={list.loading} variant="danger" size="sm">
                Delete
              </Button>
            </>
          ) : null
        }
      />

      <div className="mt-4">
        <Table<Project>
          columns={columns}
          data={listMenu.rows}
          selectedIds={list.selectedIds}
          onSelectAll={list.onSelectAll}
          onSelectRow={list.onSelectRow}
          loading={list.initialLoading}
          emptyMessage={list.error || "No projects found"}
          getRowId={(p) => String(p.id)}
          onRowClick={list.handleRowClick}
          showFilter
          showCheckbox
        />
      </div>
    </div>
  );
};

export default ProjectList;
