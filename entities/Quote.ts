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
import type { Template } from "./Template";
import type { Invoice } from "./Invoice";
import type { Organization } from "./Organization";
import type { QuoteItem } from "./QuoteItem";

@Index("IDX_quotes_organizationId", ["organizationId"])
@Index("IDX_quotes_customerId", ["customerId"])
@Entity("quotes")
export class Quote {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  quoteNumber!: string;

  @Column()
  quoteDate!: Date;

  @Column({ nullable: true })
  expiryDate!: Date;

  @Column({ default: "PKR" })
  currency!: string;

  @Column({ nullable: true, transformer: encryptedText })
  referenceNumber!: string;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  subTotal!: number;

  // Discount % applies to (items net + shipping + adjustment), like the invoice engine.
  @Column("float", { default: 0 })
  discountPercent!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  discount!: number;

  // Sum of per-line tax amounts (informational; already inside line amounts).
  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  tax!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  shipping!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  adjustment!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  total!: number;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  notes!: string;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  terms!: string;

  // 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Declined' | 'Expired' | 'Converted'
  @Column({ default: "Draft" })
  status!: string;

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

  // Set once converted; blocks duplicate conversion.
  @ManyToOne("invoices", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "convertedInvoiceId" })
  convertedInvoice!: Invoice;

  @Column({ type: "integer", nullable: true })
  convertedInvoiceId!: number | null;

  // Project created from this quote (one project per quote).
  @Column({ type: "integer", nullable: true })
  projectId!: number | null;

  @OneToMany("quote_items", "quote", { cascade: true })
  items!: QuoteItem[];

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

Object.defineProperty(Quote, "name", { value: "Quote", configurable: true });
