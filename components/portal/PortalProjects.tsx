"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderKanban, Clock } from "lucide-react";
import { usePortalQuery, portalSend, errorText } from "@/lib/portalApi";
import { formatDate } from "@/lib/format";
import { formatDuration } from "@/types/timeEntry";
import { getNavState, setNavState } from "@/lib/clientNavState";
import { statusVariant } from "@/lib/statusVariants";
import { Table, StatusBadge, Tabs, Button } from "@/components/ui";
import SplitView from "@/components/ui/SplitView";
import DetailHeader from "@/components/ui/DetailHeader";
import { DetailRow, DetailSection } from "@/components/ui/DetailParts";
import type { TableColumn } from "@/types/common";
import { PageLoading, ErrorNote } from "./PortalUI";
import PortalComments from "./PortalComments";
import { TableList } from "./PortalDocuments";

interface ProjectRow {
  id: number;
  projectNumber: string;
  name: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  loggedHours: number;
  budgetHours: number;
  progress: number | null;
}

const hours = (h: number) => formatDuration(Math.round(h * 60));
const bold = (v: React.ReactNode) => <span className="font-bold text-gray-900">{v}</span>;
const muted = (v: React.ReactNode) => <span className="text-gray-600">{v}</span>;

const PROJECT_STATUSES = ["All", "Active", "On Hold", "Completed"];

const ProgressBar: React.FC<{ value: number | null }> = ({ value }) =>
  value === null ? (
    <span className="text-slate-400">—</span>
  ) : (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-9 text-right">{value}%</span>
    </div>
  );

export const PortalProjects: React.FC = () => {
  const router = useRouter();
  const selectedId = useParams<{ id?: string }>()?.id;
  const { data, error, loading } = usePortalQuery<{ projects: ProjectRow[] }>("/projects");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () => (data?.projects || []).filter((p) => status === "All" || p.status === status),
    [data, status],
  );

  const open = (row: ProjectRow) => {
    setNavState(`portal-project:${row.id}`, row);
    router.push(`/portal/projects/${row.id}`);
  };

  if (!selectedId) {
    return (
      <TableList<ProjectRow>
        title={(s) => (s === "All" ? "All Projects" : `${s} Projects`)}
        statuses={PROJECT_STATUSES}
        status={status}
        onStatus={setStatus}
        rows={rows}
        loading={loading}
        error={error}
        empty="No projects yet"
        onOpen={open}
        columns={[
          { key: "n", label: "PROJECT#", render: (p) => bold(p.projectNumber) },
          { key: "name", label: "NAME", render: (p) => muted(p.name) },
          { key: "s", label: "STATUS", render: (p) => <StatusBadge status={p.status} variant={statusVariant(p.status)} /> },
          { key: "h", label: "HOURS", render: (p) => muted(hours(p.loggedHours)) },
          { key: "p", label: "PROGRESS", render: (p) => <ProgressBar value={p.progress} /> },
        ]}
      />
    );
  }

  return (
    <SplitView
      filter={{
        value: status,
        options: PROJECT_STATUSES.map((s) => ({ value: s, label: s === "All" ? "All Projects" : `${s} Projects` })),
        onChange: setStatus,
      }}
      rows={rows.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.projectNumber,
        right: p.status,
      }))}
      loading={loading}
      selectedId={selectedId}
      hideCheckbox
      onOpen={(id) => {
        const row = rows.find((r) => String(r.id) === String(id));
        if (row) open(row);
      }}
      emptyText={error ? error.message : "No projects yet"}
      detailKey={selectedId}
    >
      <PortalProjectView />
    </SplitView>
  );
};

interface ProjectDetail {
  project: {
    id: number;
    projectNumber: string;
    name: string;
    description?: string | null;
    status: string;
    startDate?: string | null;
    endDate?: string | null;
    budgetHours: number;
  };
  totals: { loggedHours: number; billedHours: number; unbilledHours: number };
  tasks: { id: number; name: string; status: string; loggedHours: number; billedHours: number; unbilledHours: number }[];
  timeEntries: {
    id: number;
    date: string;
    task?: string | null;
    description?: string | null;
    duration: number;
    billing: string;
    approvalStatus: string;
  }[];
  canApprove: boolean;
}

type Tab = "overview" | "tasks" | "time" | "comments";

export const PortalProjectView: React.FC = () => {
  const id = useParams<{ id?: string }>()?.id;
  const router = useRouter();
  const [nav, setNav] = useState<ProjectRow>();
  useEffect(() => {
    setNav(id ? getNavState<ProjectRow>(`portal-project:${id}`) : undefined);
  }, [id]);
  const { data, error, loading, refresh } = usePortalQuery<ProjectDetail>(id ? `/projects/${id}` : null);
  const [tab, setTab] = useState<Tab>("overview");
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const project = data?.project ?? nav;
  if (!project) {
    if (error) return <ErrorNote message={error.message || "Project not found"} />;
    return loading || !error ? <PageLoading /> : null;
  }
  const full = data;
  const timeEntries = full?.timeEntries || [];
  const canApprove = !!full?.canApprove;
  const reviewable = timeEntries.filter((e) => e.billing === "Unbilled" && e.approvalStatus === "Pending");
  const toggle = (entryId: number) =>
    setSelected((s) => (s.includes(entryId) ? s.filter((x) => x !== entryId) : [...s, entryId]));

  const review = async (ids: number[], action: "approve" | "reject") => {
    setBusy(true);
    setActionError("");
    try {
      await portalSend("POST", "/time", { ids, action });
      setSelected([]);
      await refresh();
    } catch (err) {
      setActionError(errorText(err, "Failed to update time entries"));
    } finally {
      setBusy(false);
    }
  };

  const taskColumns: TableColumn<ProjectDetail["tasks"][number]>[] = [
    {
      key: "n",
      label: "TASK",
      render: (t) => (
        <span className={t.status === "Completed" ? "text-slate-400 line-through" : "font-bold text-slate-900"}>{t.name}</span>
      ),
    },
    { key: "l", label: "LOGGED", align: "right" as const, render: (t) => muted(hours(t.loggedHours)) },
    { key: "b", label: "BILLED", align: "right" as const, render: (t) => muted(hours(t.billedHours)) },
    { key: "u", label: "UNBILLED", align: "right" as const, render: (t) => muted(hours(t.unbilledHours)) },
  ];

  const timeColumns: TableColumn<ProjectDetail["timeEntries"][number]>[] = [
    ...(canApprove
      ? [
          {
            key: "sel",
            label: "",
            render: (e: ProjectDetail["timeEntries"][number]) =>
              e.billing === "Unbilled" && e.approvalStatus === "Pending" ? (
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary cursor-pointer"
                  checked={selected.includes(e.id)}
                  onChange={() => toggle(e.id)}
                />
              ) : null,
          },
        ]
      : []),
    { key: "d", label: "DATE", render: (e) => muted(formatDate(e.date)) },
    { key: "t", label: "TASK", render: (e) => muted(e.task || "—") },
    { key: "x", label: "DESCRIPTION", render: (e) => muted(e.description || "") },
    { key: "h", label: "HOURS", align: "right" as const, render: (e) => bold(formatDuration(e.duration)) },
    { key: "b", label: "BILLING", render: (e) => <StatusBadge status={e.billing} variant={statusVariant(e.billing)} /> },
    { key: "a", label: "APPROVAL", render: (e) => muted(e.billing === "Billed" ? "—" : e.approvalStatus) },
  ];

  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "Tasks", value: "tasks", count: full ? full.tasks.length : undefined },
    { label: "Time", value: "time", count: canApprove && reviewable.length ? reviewable.length : undefined },
    { label: "Comments", value: "comments" },
  ];

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 py-2">
      <DetailHeader
        title={project.name}
        subtitle={
          <>
            <span>{project.projectNumber}</span>
            <StatusBadge status={project.status} variant={statusVariant(project.status)} />
          </>
        }
        onClose={() => router.push("/portal/projects")}
        actions={
          tab === "time" && canApprove && selected.length > 0 ? (
            <>
              <Button size="sm" variant="danger" disabled={busy} onClick={() => review(selected, "reject")}>
                Reject ({selected.length})
              </Button>
              <Button size="sm" variant="primary" disabled={busy} onClick={() => review(selected, "approve")}>
                Approve ({selected.length})
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="border-b border-slate-200">
        <Tabs tabs={tabs} activeTab={tab} onTabChange={(v) => setTab(v as Tab)} />
      </div>

      {actionError && <ErrorNote message={actionError} />}

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
            <DetailRow label="Project Number">{project.projectNumber}</DetailRow>
            <DetailRow label="Status">{project.status}</DetailRow>
            <DetailRow label="Start Date">{formatDate(project.startDate)}</DetailRow>
            <DetailRow label="End Date">{formatDate(project.endDate)}</DetailRow>
            <DetailRow label="Budget Hours">{project.budgetHours ? `${project.budgetHours}h` : ""}</DetailRow>
            <DetailRow label="Logged Hours">{full ? hours(full.totals.loggedHours) : hours(nav?.loggedHours ?? 0)}</DetailRow>
            {full && <DetailRow label="Billed Hours">{hours(full.totals.billedHours)}</DetailRow>}
            {full && <DetailRow label="Unbilled Hours">{hours(full.totals.unbilledHours)}</DetailRow>}
          </div>
          {full?.project.description && (
            <DetailSection title="Description">
              <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">{full.project.description}</p>
            </DetailSection>
          )}
        </div>
      )}

      {tab === "tasks" &&
        (full ? (
          <Table
            columns={taskColumns}
            data={full.tasks}
            getRowId={(t) => t.id}
            showCheckbox={false}
            variant="default"
            emptyMessage="No tasks yet"
            emptyIcon={FolderKanban}
          />
        ) : (
          <PageLoading />
        ))}

      {tab === "time" &&
        (full ? (
          <Table
            columns={timeColumns}
            data={timeEntries}
            getRowId={(e) => e.id}
            showCheckbox={false}
            variant="default"
            emptyMessage="No time has been logged yet"
            emptyIcon={Clock}
          />
        ) : (
          <PageLoading />
        ))}

      {tab === "comments" && <PortalComments entityType="project" entityId={project.id} />}
    </div>
  );
};
