import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from "typeorm";

/** Customer actions in the portal, surfaced to the business as notifications. */
@Entity("portal_activities")
@Index(["organizationId", "createdAt"])
export class PortalActivity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  organizationId!: number;

  @Column()
  customerId!: number;

  // invoice_viewed | quote_viewed | quote_accepted | quote_declined | comment_added
  // | time_approved | time_rejected | profile_updated
  @Column()
  type!: string;

  @Column({ type: "varchar", nullable: true })
  entityType!: string | null;

  @Column({ type: "integer", nullable: true })
  entityId!: number | null;

  @Column({ type: "varchar", nullable: true })
  title!: string | null;

  @Column({ type: "timestamp", nullable: true })
  readAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}

Object.defineProperty(PortalActivity, "name", { value: "PortalActivity", configurable: true });
