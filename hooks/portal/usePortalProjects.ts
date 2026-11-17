"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { usePortalQuery, portalSend, errorText } from "@/lib/portalApi";
import { getNavState } from "@/lib/clientNavState";
import type { ProjectRow, ProjectDetail } from "@/components/portal/PortalProjects";

/** Project list for the portal with a status filter. */
export const usePortalProjectList = () => {
  const { data, error, loading } = usePortalQuery<{ projects: ProjectRow[] }>("/projects");
  const [status, setStatus] = useState("All");
  const rows = useMemo(
    () => (data?.projects || []).filter((p) => status === "All" || p.status === status),
    [data, status],
  );
  return { data, error, loading, status, setStatus, rows };
};

/** One project in the portal: detail data plus time-entry approval. */
export const usePortalProjectDetail = () => {
  const id = useParams<{ id?: string }>()?.id;
  const [nav, setNav] = useState<ProjectRow>();
  useEffect(() => {
    setNav(id ? getNavState<ProjectRow>(`portal-project:${id}`) : undefined);
  }, [id]);
  const { data, error, loading, refresh } = usePortalQuery<ProjectDetail>(id ? `/projects/${id}` : null);
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

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

  return { id, nav, data, error, loading, selected, setSelected, busy, actionError, toggle, review };
};
