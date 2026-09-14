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
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ type: "text", nullable: true })
  address!: string;

  @Column({ default: "PKR" })
  currency!: string;

  @Column({ nullable: true })
  logoUrl!: string;

  @Column({ nullable: true })
  website!: string;

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
