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
import type { Organization } from "./Organization";

@Entity("expense_categories")
export class ExpenseCategory {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  name!: string;

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

Object.defineProperty(ExpenseCategory, "name", { value: "ExpenseCategory", configurable: true });
