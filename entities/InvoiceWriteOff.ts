import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { User } from "./User";
import type { Invoice } from "./Invoice";
import type { Organization } from "./Organization";

@Entity("invoice_write_offs")
export class InvoiceWriteOff {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @ManyToOne("invoices", "writeOffs", { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoiceId" })
  invoice!: Invoice;

  @Column()
  invoiceId!: number;

  @ManyToOne("organizations", { nullable: true })
  @JoinColumn({ name: "organizationId" })
  organization!: Organization;

  @Column({ nullable: true })
  organizationId!: number;

  @ManyToOne("users")
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: "text" })
  reason!: string;

  @Column()
  writeOffDate!: Date;

  @Column({ nullable: true })
  reversedAt!: Date;

  @Column({ nullable: true })
  reversedByUserId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

Object.defineProperty(InvoiceWriteOff, "name", { value: "InvoiceWriteOff", configurable: true });
