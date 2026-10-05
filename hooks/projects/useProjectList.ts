"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOrgRouter as useRouter } from "@/hooks/organization/useOrgRouter";
import useRecords from "@/hooks/common/useRecords";
import useProjectDelete from "@/hooks/projects/useProjectDelete";
import { SWR_KEYS } from "@/lib/swr";
import { customerLabel } from "@/lib/format";
import type { Project } from "@/types/project";

const ALL = "All";

const useProjectList = (initial?: Project[]) => {
  const router = useRouter();
  const { records, loading, error } = useRecords<Project>(SWR_KEYS.projects, "projects", initial);
  const del = useProjectDelete();

  const searchParams = useSearchParams();
  const search = (searchParams?.get("search") || "").toLowerCase().trim();
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const projects = useMemo(
    () =>
      records.filter((p) => {
        if (statusFilter !== ALL && p.status !== statusFilter) return false;
        if (!search) return true;
        return [p.projectNumber, p.name, customerLabel(p.customer)].some((v) =>
          (v || "").toLowerCase().includes(search),
        );
      }),
    [records, statusFilter, search],
  );

  useEffect(() => setSelectedIds([]), [statusFilter, search]);

  const onSelectAll = useCallback(
    (checked: boolean) => setSelectedIds(checked ? projects.map((p) => String(p.id)) : []),
    [projects],
  );
  const onSelectRow = useCallback((id: string | number, checked: boolean) => {
    const stringId = String(id);
    setSelectedIds((prev) =>
      checked ? [...prev, stringId] : prev.filter((x) => x !== stringId),
    );
  }, []);

  return {
    projects,
    loading: loading || del.loading,
    initialLoading: loading,
    error,
    statusFilter,
    setStatusFilter,
    dropdownOpen,
    setDropdownOpen,
    selectedIds,
    onSelectAll,
    onSelectRow,
    confirmDialog: del.confirmDialog,
    confirmDelete: del.confirmDelete,
    hideConfirmDialog: del.hideConfirmDialog,
    handleNew: () => router.push("/projects/new"),
    handleEdit: (p: Project) => router.push(`/projects/edit/${p.id}`),
    handleRowClick: (p: Project) => router.push(`/projects/${p.id}`),
    handleDelete: (ids?: (string | number)[]) =>
      del.requestDelete(ids && ids.length ? ids : selectedIds, () => setSelectedIds([])),
  };
};

export default useProjectList;
