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
import { encryptedText, encryptedArray, encryptedJson } from "@/lib/encryption";
import type { User } from "./User";
import type { Organization } from "./Organization";

@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  customerType!: string; // 'Business' | 'Individual'

  @Column({ nullable: true, transformer: encryptedText })
  companyName!: string;

  @Column({ transformer: encryptedText })
  displayName!: string;

  @Column({ default: "USD" })
  currency!: string;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  address!: string;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  remarks!: string;

  @Column({ default: "Active" })
  status!: string;

  @Column({ type: "text", nullable: true, transformer: encryptedArray })
  documents!: string[]; // Stores relative paths to documents

  @Column("jsonb", { nullable: true, default: [], transformer: encryptedJson })
  contacts!: {
    firstName?: string;
    lastName?: string;
    email?: string;
    contact?: string;
  }[];

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

Object.defineProperty(Customer, "name", { value: "Customer", configurable: true });
