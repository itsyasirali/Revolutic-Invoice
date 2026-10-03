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
import { encryptedText } from "@/lib/encryption";
import type { Project } from "./Project";
import type { Organization } from "./Organization";

@Entity("project_tasks")
export class ProjectTask {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @ManyToOne("projects", "tasks", { onDelete: "CASCADE" })
  @JoinColumn({ name: "projectId" })
  project!: Project;

  @Column()
  projectId!: number;

  @Column({ type: "text", transformer: encryptedText })
  name!: string;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  description!: string | null;

  // 'Open' | 'Completed'
  @Column({ default: "Open" })
  status!: string;

  @Column("integer", { default: 0 })
  sortOrder!: number;

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

Object.defineProperty(ProjectTask, "name", { value: "ProjectTask", configurable: true });
