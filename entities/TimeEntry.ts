import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { encryptedText } from "@/lib/encryption";
import type { User } from "./User";
import type { Customer } from "./Customer";
import type { Invoice } from "./Invoice";
import type { Organization } from "./Organization";
import type { Project } from "./Project";
import type { ProjectTask } from "./ProjectTask";

@Entity("time_entries")
export class TimeEntry {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  entryNumber!: string;

  @ManyToOne("users")
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne("customers", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @Column({ type: "integer", nullable: true })
  customerId!: number | null;

  @ManyToOne("projects", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "projectId" })
  projectRef!: Project;

  @Column({ type: "integer", nullable: true })
  projectId!: number | null;

  @ManyToOne("project_tasks", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "taskId" })
  task!: ProjectTask;

  @Column({ type: "integer", nullable: true })
  taskId!: number | null;

  // Project name snapshot kept in sync with projectId (free text when no project is linked).
  @Column({ type: "text", nullable: true, transformer: encryptedText })
  project!: string;

  @ManyToOne("invoices", "timeEntries", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "invoiceId" })
  invoice!: Invoice;

  @Column({ type: "integer", nullable: true })
  invoiceId!: number | null;

  @Column()
  date!: Date;

  // "HH:mm" (24h)
  @Column({ nullable: true })
  startTime!: string;

  @Column({ nullable: true })
  endTime!: string;

  // Duration in minutes, always computed server-side.
  @Column("integer", { default: 0 })
  duration!: number;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  description!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  hourlyRate!: number;

  // Server-computed: hourlyRate x duration / 60.
  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  amount!: number;

  @Column({ default: true })
  billable!: boolean;

  @Column({ default: false })
  invoiced!: boolean;

  // 'Non-Billable' | 'Unbilled' | 'Invoiced' (derived server-side)
  @Column({ default: "Unbilled" })
  status!: string;

  // Customer review of billable time in the portal: 'Pending' | 'Approved' | 'Rejected'
  @Column({ default: "Pending" })
  approvalStatus!: string;

  @Column({ type: "timestamp", nullable: true })
  approvedAt!: Date | null;

  @ManyToOne("organizations", { nullable: true })
  @JoinColumn({ name: "organizationId" })
  organization!: Organization;

  @Column({ nullable: true })
  organizationId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

Object.defineProperty(TimeEntry, "name", { value: "TimeEntry", configurable: true });
