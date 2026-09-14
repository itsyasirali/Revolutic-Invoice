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
import type { User } from "./User";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  industry!: string | null;

  @Column({ nullable: true })
  businessLocation!: string | null;

  @Column({ nullable: true })
  stateProvince!: string | null;

  @Column({ nullable: true })
  streetAddress!: string | null;

  @Column({ nullable: true })
  city!: string | null;

  @Column({ nullable: true })
  zipCode!: string | null;

  @Column({ type: "text", nullable: true })
  address!: string | null;

  @Column({ default: "PKR" })
  currency!: string;

  @Column({ default: "English" })
  language!: string;

  @Column({ default: "(GMT 5:00) Pakistan Time (Asia/Karachi)" })
  timeZone!: string;

  @Column({ nullable: true })
  email!: string | null;

  @Column({ nullable: true })
  phone!: string | null;

  @Column({ nullable: true })
  logoUrl!: string | null;

  @Column({ nullable: true })
  website!: string | null;

  // Owner
  @ManyToOne("users")
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

Object.defineProperty(Organization, "name", { value: "Organization", configurable: true });
