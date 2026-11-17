"use client";

import { useState } from "react";
import useOrgRouter from "@/hooks/organization/useOrgRouter";
import { addTask, billProject } from "@/hooks/projects/useProject";

/** Billing and quick-add-task actions on the project details page. */
const useProjectDetailActions = (projectId: number | undefined, refetch: () => Promise<unknown> | void) => {
  const router = useOrgRouter();
  const [billing, setBilling] = useState(false);
  const [taskName, setTaskName] = useState("");

  const createInvoice = async () => {
    if (projectId === undefined) return;
    setBilling(true);
    const invoice = await billProject(projectId);
    setBilling(false);
    if (invoice) router.push(`/invoices/${invoice.id}`);
    else await refetch();
  };

  const submitTask = async () => {
    if (projectId === undefined || !taskName.trim()) return;
    if (await addTask(projectId, taskName.trim())) {
      setTaskName("");
      await refetch();
    }
  };

  return { billing, taskName, setTaskName, createInvoice, submitTask };
};

export default useProjectDetailActions;
