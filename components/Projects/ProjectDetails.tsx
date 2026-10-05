"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { FileQuestion, Plus, Trash2, FileText, Receipt, Timer } from "lucide-react";
import { OrgLink as Link } from "@/components/organization/OrgLink";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import {
  Button,
  Input,
  StatusBadge,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState,
  Table,
  Tabs,
} from "@/components/ui";
import { InfoCard, InfoField } from "@/components/ui/DetailParts";
import DetailHeader from "@/components/ui/DetailHeader";
import useProject, { addTask, updateTask, deleteTask, billProject } from "@/hooks/projects/useProject";
import useProjectDelete from "@/hooks/projects/useProjectDelete";
import { statusVariant } from "@/lib/statusVariants";
import { customerLabel, formatDate, formatMoney } from "@/lib/format";
import { formatDuration, type TimeEntry } from "@/types/timeEntry";
import type { Expense } from "@/types/expense";
import type { ProjectInvoiceRef } from "@/types/project";
import type { TableColumn } from "@/types/common";
import BusinessPortalComments from "@/components/portal/BusinessPortalComments";

type Tab = "tasks" | "time" | "expenses" | "invoices";

const noop = () => {};

const timeColumns: TableColumn<TimeEntry>[] = [
  { key: "entryNumber", label: "ENTRY #", render: (t) => <span className="font-bold text-gray-900">{t.entryNumber}</span> },
  { key: "date", label: "DATE", render: (t) => <span className="text-gray-600">{formatDate(t.date)}</span> },
  { key: "task", label: "TASK", render: (t) => <span className="text-gray-600">{t.task?.name || ""}</span> },
  { key: "description", label: "DESCRIPTION", render: (t) => <span className="text-gray-600">{t.description || ""}</span> },
  { key: "duration", label: "DURATION", render: (t) => <span className="text-gray-900">{formatDuration(t.duration)}</span> },
  { key: "amount", label: "AMOUNT", align: "right", render: (t) => <span className="font-bold text-gray-900">{formatMoney(t.amount)}</span> },
  { key: "status", label: "STATUS", render: (t) => <StatusBadge status={t.status} variant={statusVariant(t.status)} /> },
];

const expenseColumns: TableColumn<Expense>[] = [
  { key: "expenseNumber", label: "EXPENSE #", render: (e) => <span className="font-bold text-gray-900">{e.expenseNumber}</span> },
  { key: "expenseDate", label: "DATE", render: (e) => <span className="text-gray-600">{formatDate(e.expenseDate)}</span> },
  { key: "category", label: "CATEGORY", render: (e) => <span className="text-gray-600">{e.category?.name || ""}</span> },
  { key: "total", label: "AMOUNT", align: "right", render: (e) => <span className="font-bold text-gray-900">{formatMoney(e.total)} {e.currency}</span> },
  { key: "status", label: "STATUS", render: (e) => <StatusBadge status={e.status} variant={statusVariant(e.status)} /> },
];

const invoiceColumns: TableColumn<ProjectInvoiceRef>[] = [
  { key: "invoiceNumber", label: "INVOICE #", render: (i) => <span className="font-bold text-gray-900">{i.invoiceNumber}</span> },
  { key: "total", label: "AMOUNT", align: "right", render: (i) => <span className="font-bold text-gray-900">{formatMoney(i.total)} {i.currency}</span> },
  { key: "status", label: "STATUS", render: (i) => <StatusBadge status={i.status || "Draft"} /> },
];

const Progress: React.FC<{ label: string; value: number; budget: number; format: (n: number) => string }> = ({
  label,
  value,
  budget,
  format,
}) => {
  const pct = budget > 0 ? Math.min(100, (value / budget) * 100) : 0;
  const over = budget > 0 && value > budget;
  return (
    <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-900">
        {format(value)}
        {budget > 0 ? ` / ${format(budget)}` : " (no budget set)"}
      </p>
      {budget > 0 && (
        <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full ${over ? "bg-red-500" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
};

const ProjectDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, loading, notFound, refetch } = useProject(params?.id);
  const del = useProjectDelete();
  const [tab, setTab] = useState<Tab>("tasks");
  const [billing, setBilling] = useState(false);
  const [taskName, setTaskName] = useState("");

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="px-6 py-10">
        <EmptyState
          icon={FileQuestion}
          title="Project not found"
          message={notFound ? "It may have been deleted or belongs to another organization." : ""}
        />
      </div>
    );
  }

  const { project, tasks, timeEntries, expenses, quote, invoices } = data;
  const stats = project.stats;
  const fixed = project.billingMethod === "Fixed";
  const unbilledTime = fixed ? 0 : stats?.unbilledTimeAmount || 0;
  const unbilledExpenses = stats?.unbilledExpenseAmount || 0;
  const fixedPending = fixed && !project.fixedInvoiceId ? Number(project.fixedAmount) : 0;
  const unbilledTotal = unbilledTime + unbilledExpenses + fixedPending;
  const budgetUsed = (stats?.invoicedTimeAmount || 0) + (stats?.unbilledTimeAmount || 0) + (stats?.expenseTotal || 0);

  const createInvoice = async () => {
    setBilling(true);
    const invoice = await billProject(project.id);
    setBilling(false);
    if (invoice) router.push(`/invoices/${invoice.id}`);
    else await refetch();
  };

  const submitTask = async () => {
    if (!taskName.trim()) return;
    if (await addTask(project.id, taskName.trim())) {
      setTaskName("");
      await refetch();
    }
  };

  const tabs = [
    { label: "Tasks", value: "tasks", count: tasks.length },
    { label: "Time", value: "time", count: timeEntries.length },
    { label: "Expenses", value: "expenses", count: expenses.length },
    { label: "Invoices", value: "invoices", count: invoices.length },
  ];

  const tableBase = { selectedIds: [], onSelectAll: noop, onSelectRow: noop, showCheckbox: false, variant: "spacious" as const };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-2">
      <ConfirmDialog
        isOpen={del.confirmDialog.show}
        title="Delete Project"
        message="Are you sure you want to delete this project? Logged time and expenses stay, but are no longer linked to it."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={del.confirmDelete}
        onCancel={del.hideConfirmDialog}
      />

      <DetailHeader
        title={project.name}
        subtitle={
          <>
            <StatusBadge status={project.status} variant={statusVariant(project.status)} />
            <span>
              {project.projectNumber} · {customerLabel(project.customer)} · {project.billingMethod}
            </span>
          </>
        }
        onEdit={() => router.push(`/projects/edit/${project.id}`)}
        editTitle="Edit project"
        onClose={() => router.push("/projects")}
        menu={[
          { label: "Create Invoice", disabled: billing || unbilledTotal <= 0, onClick: createInvoice },
          { label: "Log Time", onClick: () => router.push(`/time-tracking/new?projectId=${project.id}`) },
          { label: "Add Expense", onClick: () => router.push(`/expenses/new?projectId=${project.id}`) },
          {
            label: "Delete",
            danger: true,
            onClick: () => del.requestDelete([project.id], () => router.push("/projects")),
          },
        ]}
      />

      <InfoCard title="Project Information">
        <InfoField label="Customer">
          {project.customer && (
            <Link href={`/customers/${project.customer.id}`} className="text-primary hover:underline">
              {customerLabel(project.customer)}
            </Link>
          )}
        </InfoField>
        <InfoField label="Quote">
          {quote && (
            <Link href={`/quotes/${quote.id}`} className="text-primary hover:underline">
              {quote.quoteNumber}
            </Link>
          )}
        </InfoField>
        <InfoField label="Billing">
          {fixed
            ? `Fixed price ${formatMoney(project.fixedAmount)} ${project.currency}${project.fixedInvoiceId ? " (invoiced)" : ""}`
            : `Hourly ${formatMoney(project.hourlyRate)} ${project.currency}/h`}
        </InfoField>
        <InfoField label="Start Date">{formatDate(project.startDate)}</InfoField>
        <InfoField label="End Date">{formatDate(project.endDate)}</InfoField>
        <InfoField label="Description" wide>
          {project.description}
        </InfoField>
      </InfoCard>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">Budget & Billing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Progress
            label="Hours logged"
            value={(stats?.loggedMinutes || 0) / 60}
            budget={Number(project.budgetHours)}
            format={(n) => `${n.toFixed(1)}h`}
          />
          <Progress
            label={`Cost vs budget (${project.currency})`}
            value={budgetUsed}
            budget={Number(project.budgetAmount)}
            format={formatMoney}
          />
          <InfoField label="Billable / Non-billable hours">
            {formatDuration(stats?.billableMinutes || 0)} / {formatDuration(stats?.nonBillableMinutes || 0)}
          </InfoField>
          <InfoField label="Unbilled time">
            {fixed ? "Covered by fixed price" : `${formatMoney(unbilledTime)} ${project.currency}`}
          </InfoField>
          <InfoField label="Unbilled expenses">
            {formatMoney(unbilledExpenses)} {project.currency}
          </InfoField>
          <InfoField label="Ready to invoice">
            {formatMoney(unbilledTotal)} {project.currency}
          </InfoField>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <Tabs tabs={tabs} activeTab={tab} onTabChange={(v) => setTab(v as Tab)} />

        {tab === "tasks" && (
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  placeholder="New task name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitTask();
                    }
                  }}
                  fullWidth
                />
              </div>
              <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />} onClick={submitTask}>
                Add Task
              </Button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-500">No tasks yet. Add one to log time against it.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={t.status === "Completed"}
                      onChange={async (e) => {
                        if (await updateTask(project.id, t.id, { status: e.target.checked ? "Completed" : "Open" })) {
                          await refetch();
                        }
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span
                      className={`flex-1 text-sm ${t.status === "Completed" ? "line-through text-slate-400" : "text-slate-900 font-medium"}`}
                    >
                      {t.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDuration(
                        timeEntries.filter((e) => e.taskId === t.id).reduce((s, e) => s + e.duration, 0),
                      )}
                    </span>
                    <button
                      onClick={async () => {
                        if (await deleteTask(project.id, t.id)) await refetch();
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "time" && (
          <Table<TimeEntry>
            {...tableBase}
            columns={timeColumns}
            data={timeEntries}
            getRowId={(t) => t.id}
            onRowClick={(t) => router.push(`/time-tracking/${t.id}`)}
            emptyMessage="No time logged on this project"
            emptyIcon={Timer}
          />
        )}
        {tab === "expenses" && (
          <Table<Expense>
            {...tableBase}
            columns={expenseColumns}
            data={expenses}
            getRowId={(e) => e.id}
            onRowClick={(e) => router.push(`/expenses/${e.id}`)}
            emptyMessage="No expenses on this project"
            emptyIcon={Receipt}
          />
        )}
        {tab === "invoices" && (
          <Table<ProjectInvoiceRef>
            {...tableBase}
            columns={invoiceColumns}
            data={invoices}
            getRowId={(i) => i.id}
            onRowClick={(i) => router.push(`/invoices/${i.id}`)}
            emptyMessage="Nothing has been invoiced yet"
            emptyIcon={FileText}
          />
        )}
      </div>
      <BusinessPortalComments entityType="project" entityId={project.id} />
    </div>
  );
};

export default ProjectDetails;
