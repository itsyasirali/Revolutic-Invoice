import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { encryptedText, encryptedArray } from "@/lib/encryption";
import type { User } from "./User";
import type { Customer } from "./Customer";
import type { Template } from "./Template";
import type { InvoiceItem } from "./InvoiceItem";
import type { Organization } from "./Organization";
import type { InvoiceWriteOff } from "./InvoiceWriteOff";
import type { Quote } from "./Quote";
import type { Expense } from "./Expense";
import type { TimeEntry } from "./TimeEntry";

@Entity("invoices")
export class Invoice {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  invoiceNumber!: string;

  @Column()
  invoiceDate!: Date;

  @Column({ nullable: true })
  dueDate!: Date;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  subTotal!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column({ default: "PKR" })
  currency!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  received!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  remaining!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  previousRemaining!: number;

  @Column({ default: "Draft" })
  status!: string; // 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled' | 'Written Off'

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  notes!: string;

  @Column({ type: "text", nullable: true, transformer: encryptedArray })
  recipients!: string[];

  @Column("float", { default: 0 })
  discountPercent!: number;

  // Relationships
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

  @ManyToOne("customers")
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @Column()
  customerId!: number;

  @ManyToOne("templates", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "templateId" })
  template!: Template;

  @Column({ type: "integer", nullable: true })
  templateId!: number | null;

  @OneToMany("invoice_items", "invoice", { cascade: true })
  items!: InvoiceItem[];

  @OneToMany("invoice_write_offs", "invoice")
  writeOffs!: InvoiceWriteOff[];

  // Source quote when this invoice was created via Quote -> Invoice conversion.
  @ManyToOne("quotes", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "quoteId" })
  quote!: Quote;

  @Column({ type: "integer", nullable: true })
  quoteId!: number | null;

  @OneToMany("expenses", "invoice")
  expenses!: Expense[];

  @OneToMany("time_entries", "invoice")
  timeEntries!: TimeEntry[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

Object.defineProperty(Invoice, "name", { value: "Invoice", configurable: true });
