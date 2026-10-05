import "reflect-metadata";
import {
  Entity,
  Index,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { encryptedText } from "@/lib/encryption";
import type { User } from "./User";
import type { Customer } from "./Customer";
import type { Quote } from "./Quote";
import type { Invoice } from "./Invoice";
import type { Organization } from "./Organization";
import type { ProjectTask } from "./ProjectTask";

@Index("IDX_projects_organizationId", ["organizationId"])
@Index("IDX_projects_customerId", ["customerId"])
@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  projectNumber!: string;

  @Column({ type: "text", transformer: encryptedText })
  name!: string;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  description!: string | null;

  @ManyToOne("customers", { onDelete: "CASCADE" })
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @Column()
  customerId!: number;

  // Quote this project was created from (Quote -> Project).
  @ManyToOne("quotes", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "quoteId" })
  quote!: Quote;

  @Column({ type: "integer", nullable: true })
  quoteId!: number | null;

  // 'Active' | 'On Hold' | 'Completed'
  @Column({ default: "Active" })
  status!: string;

  // 'Hourly' bills logged time at each entry's rate; 'Fixed' bills fixedAmount once.
  @Column({ default: "Hourly" })
  billingMethod!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  hourlyRate!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  fixedAmount!: number;

  // Invoice that billed the fixed fee (null until billed).
  @ManyToOne("invoices", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "fixedInvoiceId" })
  fixedInvoice!: Invoice;

  @Column({ type: "integer", nullable: true })
  fixedInvoiceId!: number | null;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  budgetHours!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  budgetAmount!: number;

  @Column({ default: "PKR" })
  currency!: string;

  @Column({ type: "timestamp", nullable: true })
  startDate!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endDate!: Date | null;

  @OneToMany("project_tasks", "project")
  tasks!: ProjectTask[];

  @ManyToOne("users")
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: number;

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

Object.defineProperty(Project, "name", { value: "Project", configurable: true });
