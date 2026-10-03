import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import type { Customer } from "./Customer";
import type { Organization } from "./Organization";

/** A customer's login to the Customer Portal (separate from application users). */
@Entity("portal_users")
@Index(["customerId", "email"], { unique: true })
export class PortalUser {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Index()
  @Column()
  email!: string;

  @Column({ type: "varchar", nullable: true })
  name!: string | null;

  @Column({ type: "varchar", nullable: true })
  passwordHash!: string | null;

  // SHA-256 of the one-time invite token; the raw token only exists in the link.
  @Index()
  @Column({ type: "varchar", nullable: true })
  inviteTokenHash!: string | null;

  @Column({ type: "timestamp", nullable: true })
  inviteExpiresAt!: Date | null;

  // 'Invited' | 'Active' | 'Disabled'
  @Column({ default: "Invited" })
  status!: string;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt!: Date | null;

  @ManyToOne("customers", { onDelete: "CASCADE" })
  @JoinColumn({ name: "customerId" })
  customer!: Customer;

  @Column()
  customerId!: number;

  @ManyToOne("organizations", { onDelete: "CASCADE" })
  @JoinColumn({ name: "organizationId" })
  organization!: Organization;

  @Column()
  organizationId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

Object.defineProperty(PortalUser, "name", { value: "PortalUser", configurable: true });
