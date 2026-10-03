"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { usePortalQuery, portalSend, errorText } from "@/lib/portalApi";
import { formatDate } from "@/lib/format";
import { formatDuration } from "@/types/timeEntry";
import {
  PageTitle,
  PCard,
  PTable,
  Stat,
  Status,
  PageLoading,
  ErrorNote,
  primaryBtn,
  dangerBtn,
} from "./PortalUI";
import PortalComments from "./PortalComments";

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

export const PortalProjects: React.FC = () => {
  const { data, error, loading } = usePortalQuery<{ projects: ProjectRow[] }>("/projects");
  if (loading) return <PageLoading />;
  if (error) return <ErrorNote message={error.message} />;
  return (
    <>
      <PageTitle title="Projects" subtitle="Progress on the work being done for you." />
      <PCard>
        <PTable<ProjectRow>
          rows={data?.projects || []}
          getId={(p) => p.id}
          href={(p) => `/portal/projects/${p.id}`}
          empty="No projects yet."
          columns={[
            {
              key: "n",
              label: "Project",
              render: (p) => (
                <div>
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-[12px] text-slate-500">{p.projectNumber}</p>
                </div>
              ),
            },
            { key: "s", label: "Status", render: (p) => <Status status={p.status} /> },
            { key: "h", label: "Hours", render: (p) => hours(p.loggedHours) },
            {
              key: "p",
              label: "Progress",
              render: (p) =>
                p.progress === null ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-[12px] text-slate-500 w-9 text-right">{p.progress}%</span>
                  </div>
                ),
            },
          ]}
        />
      </PCard>
    </>
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
  const id = useParams<{ id: string }>()?.id;
  const { data, error, loading, refresh } = usePortalQuery<ProjectDetail>(id ? `/projects/${id}` : null);
  const [tab, setTab] = useState<Tab>("overview");
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  if (loading) return <PageLoading />;
  if (error || !data) return <ErrorNote message={error?.message || "Project not found"} />;
  const { project, totals, tasks, timeEntries, canApprove } = data;

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

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "tasks", label: "Tasks" },
    { key: "time", label: "Time" },
    { key: "comments", label: "Comments" },
  ];

  return (
    <>
      <PageTitle
        back={{ href: "/portal/projects", label: "Back to projects" }}
        title={project.name}
        subtitle={`${project.projectNumber}${project.startDate ? ` · Started ${formatDate(project.startDate)}` : ""}`}
        actions={<Status status={project.status} />}
      />

      <div className="flex gap-6 border-b border-slate-200 mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-3 text-[14px] font-medium whitespace-nowrap cursor-pointer border-b-2 -mb-px ${
              tab === t.key ? "border-primary text-primary font-semibold" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
            {t.key === "time" && reviewable.length > 0 && canApprove && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[11px] rounded-md bg-amber-100 text-amber-800">
                {reviewable.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat label="Logged hours" value={hours(totals.loggedHours)} hint={project.budgetHours ? `of ${project.budgetHours}h budget` : undefined} />
            <Stat label="Billed hours" value={hours(totals.billedHours)} tone="success" />
            <Stat label="Unbilled hours" value={hours(totals.unbilledHours)} />
          </div>
          <PCard title="About this project">
            <dl className="grid sm:grid-cols-3 gap-4 text-[14px]">
              <div>
                <dt className="text-[12px] text-slate-500">Status</dt>
                <dd className="font-semibold">{project.status}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-slate-500">Start date</dt>
                <dd className="font-semibold">{formatDate(project.startDate) || "—"}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-slate-500">End date</dt>
                <dd className="font-semibold">{formatDate(project.endDate) || "—"}</dd>
              </div>
            </dl>
            {project.description && (
              <p className="mt-4 text-[14px] text-slate-700 whitespace-pre-wrap">{project.description}</p>
            )}
          </PCard>
        </div>
      )}

      {tab === "tasks" && (
        <PCard>
          <PTable
            rows={tasks}
            getId={(t) => t.id}
            empty="No tasks yet."
            columns={[
              {
                key: "n",
                label: "Task",
                render: (t) => (
                  <span className={t.status === "Completed" ? "text-slate-400 line-through" : "font-semibold text-slate-900"}>
                    {t.name}
                  </span>
                ),
              },
              { key: "l", label: "Logged", align: "right", render: (t) => hours(t.loggedHours) },
              { key: "b", label: "Billed", align: "right", render: (t) => hours(t.billedHours) },
              { key: "u", label: "Unbilled", align: "right", render: (t) => hours(t.unbilledHours) },
            ]}
          />
        </PCard>
      )}

      {tab === "time" && (
        <PCard
          actions={
            canApprove && selected.length > 0 ? (
              <div className="flex gap-2">
                <button className={dangerBtn} disabled={busy} onClick={() => review(selected, "reject")}>
                  Reject ({selected.length})
                </button>
                <button className={primaryBtn} disabled={busy} onClick={() => review(selected, "approve")}>
                  Approve ({selected.length})
                </button>
              </div>
            ) : undefined
          }
          title="Time entries"
        >
          {actionError && <div className="mb-3"><ErrorNote message={actionError} /></div>}
          <PTable
            rows={timeEntries}
            getId={(e) => e.id}
            empty="No time has been logged yet."
            columns={[
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
              { key: "d", label: "Date", render: (e) => formatDate(e.date) },
              { key: "t", label: "Task", render: (e) => e.task || "—" },
              { key: "x", label: "Description", render: (e) => e.description || "" },
              { key: "h", label: "Hours", align: "right", render: (e) => formatDuration(e.duration) },
              { key: "b", label: "Billing", render: (e) => <Status status={e.billing} /> },
              {
                key: "a",
                label: "Approval",
                render: (e) => (e.billing === "Billed" ? "—" : e.approvalStatus),
              },
            ]}
          />
        </PCard>
      )}

      {tab === "comments" && <PortalComments entityType="project" entityId={project.id} />}
    </>
  );
};
