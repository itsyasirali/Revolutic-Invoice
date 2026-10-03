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
import type { ExpenseCategory } from "./ExpenseCategory";
import type { Project } from "./Project";

@Entity("expenses")
export class Expense {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  expenseNumber!: string;

  @Column()
  expenseDate!: Date;

  @Column({ nullable: true, transformer: encryptedText })
  vendor!: string;

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

  @ManyToOne("expense_categories", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "categoryId" })
  category!: ExpenseCategory;

  @Column({ type: "integer", nullable: true })
  categoryId!: number | null;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  description!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  amount!: number;

  @Column({ default: "PKR" })
  currency!: string;

  @Column("float", { default: 0 })
  taxPercent!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  tax!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column({ nullable: true })
  paymentMethod!: string;

  @Column({ nullable: true, transformer: encryptedText })
  referenceNumber!: string;

  @Column({ default: false })
  billable!: boolean;

  @Column({ default: false })
  invoiced!: boolean;

  @ManyToOne("invoices", "expenses", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "invoiceId" })
  invoice!: Invoice;

  @Column({ type: "integer", nullable: true })
  invoiceId!: number | null;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  notes!: string;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  attachment!: string | null;

  // 'Non-Billable' | 'Unbilled' | 'Invoiced' (derived server-side)
  @Column({ default: "Non-Billable" })
  status!: string;

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

Object.defineProperty(Expense, "name", { value: "Expense", configurable: true });
