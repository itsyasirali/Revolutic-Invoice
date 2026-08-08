import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ nullable: true })
  companyName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerified!: Date | null;

  @Column({ nullable: true })
  image!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
