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
import type { User } from "./User";
import type { Customer } from "./Customer";
import type { Template } from "./Template";
import type { PaymentAppliedInvoice } from "./PaymentAppliedInvoice";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  paymentDate!: Date;

  @Column({ nullable: true })
  paymentNumber!: number;

  @Column({ nullable: true })
  referenceNo!: string;

  @ManyToOne("User")
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne("Customer")
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @Column()
  customerId!: number;

  @Column()
  customerDisplayName!: string;

  @Column({ nullable: true })
  customerEmail!: string;

  @ManyToOne("Template", { nullable: true })
  @JoinColumn({ name: "templateId" })
  template!: Template;

  @Column({ nullable: true })
  templateId!: number;

  @Column()
  paymentMode!: string;

  @Column({ default: "Draft" })
  status!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  amountReceived!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  bankCharges!: number;

  @Column({ default: false })
  tdsApplied!: boolean;

  @Column({ default: "PKR" })
  currency!: string;

  @Column({ type: "text", nullable: true })
  notes!: string;

  @OneToMany(
    "PaymentAppliedInvoice",
    "payment",
    {
      cascade: true,
    },
  )
  appliedInvoices!: PaymentAppliedInvoice[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
