import type { DataSource } from "typeorm";
import { Project } from "@/entities/Project";
import { ProjectTask } from "@/entities/ProjectTask";
import { HttpError } from "@/lib/requestContext";

export const PROJECT_STATUSES = ["Active", "On Hold", "Completed"] as const;
export const BILLING_METHODS = ["Hourly", "Fixed"] as const;

export interface ProjectBody {
  name?: string;
  description?: string;
  customerId?: number | string;
  status?: string;
  billingMethod?: string;
  hourlyRate?: number | string;
  fixedAmount?: number | string;
  budgetHours?: number | string;
  budgetAmount?: number | string;
  currency?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export const isPresent = (v: unknown) =>
  v !== undefined && v !== null && v !== "" && v !== "null";

export const loadProject = (db: DataSource, id: number, orgId: number) =>
  db.getRepository(Project).findOne({
    where: { id, organizationId: orgId },
    relations: ["customer", "fixedInvoice"],
  });

/**
 * Validates a project (and optional task) reference from a time-entry or
 * expense payload. The customer always follows the project so billable work
 * can never be attached to a different customer than the project's.
 */
export const resolveProjectLink = async (
  db: DataSource,
  orgId: number,
  input: { projectId?: unknown; taskId?: unknown; customerId?: number | null },
) => {
  if (!isPresent(input.projectId)) {
    return { projectId: null, taskId: null, project: null as Project | null };
  }
  const project = await db
    .getRepository(Project)
    .findOne({ where: { id: Number(input.projectId), organizationId: orgId } });
  if (!project) throw new HttpError("Project not found in this organization", 404);
  if (input.customerId && input.customerId !== project.customerId) {
    throw new HttpError("The selected customer does not match the project's customer", 400);
  }

  let taskId: number | null = null;
  if (isPresent(input.taskId)) {
    const task = await db.getRepository(ProjectTask).findOne({
      where: { id: Number(input.taskId), projectId: project.id, organizationId: orgId },
    });
    if (!task) throw new HttpError("Task does not belong to the selected project", 404);
    taskId = task.id;
  }
  return { projectId: project.id, taskId, project };
};
