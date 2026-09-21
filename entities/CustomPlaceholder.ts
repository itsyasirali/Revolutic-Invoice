import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("custom_placeholders")
@Index(["organizationId", "key"], { unique: true })
export class CustomPlaceholder {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  organizationId!: number;

  @Column({ length: 40 })
  key!: string;

  @Column({ type: "varchar", length: 100, default: "" })
  label!: string;

  @Column({ type: "text" })
  value!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
