import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from "typeorm";
import { encryptedText } from "@/lib/encryption";

/** Conversation thread on an invoice or quote between the customer and the business. */
@Entity("portal_comments")
@Index(["organizationId", "entityType", "entityId"])
export class PortalComment {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  organizationId!: number;

  @Column()
  customerId!: number;

  // 'invoice' | 'quote'
  @Column()
  entityType!: string;

  @Column()
  entityId!: number;

  // 'customer' | 'business'
  @Column()
  authorType!: string;

  @Column({ type: "varchar", nullable: true })
  authorName!: string | null;

  @Column({ type: "text", transformer: encryptedText })
  message!: string;

  // Business replies can be kept internal (hidden from the portal).
  @Column({ default: true })
  visibleToCustomer!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

Object.defineProperty(PortalComment, "name", { value: "PortalComment", configurable: true });
