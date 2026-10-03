"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { swrFetcher, SWR_KEYS } from "@/lib/swr";
import type { Project, ProjectTask } from "@/types/project";

/** Projects (not completed) as Select options, plus the tasks of a chosen project. */
const useProjectOptions = (selectedProjectId?: string | null) => {
  const { data } = useSWR<{ projects?: Project[] }>(SWR_KEYS.projects, swrFetcher, {
    revalidateOnFocus: false,
  });
  const projects = useMemo(() => data?.projects || [], [data]);

  const options = useMemo(
    () =>
      projects
        .filter((p) => p.status !== "Completed" || String(p.id) === selectedProjectId)
        .map((p) => ({
          label: `${p.name} (${p.projectNumber})`,
          value: String(p.id),
        })),
    [projects, selectedProjectId],
  );

  const { data: detail } = useSWR<{ tasks?: ProjectTask[] }>(
    selectedProjectId ? `${SWR_KEYS.projects}/${selectedProjectId}` : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );
  const taskOptions = useMemo(
    () =>
      (detail?.tasks || [])
        .filter((t) => t.status !== "Completed")
        .map((t) => ({ label: t.name, value: String(t.id) })),
    [detail],
  );

  return { projects, options, taskOptions };
};

export default useProjectOptions;
