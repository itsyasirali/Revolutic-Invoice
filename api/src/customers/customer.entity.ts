import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  customerType: string; // 'Business' | 'Individual'

  @Column({ nullable: true })
  companyName: string;

  @Column()
  displayName: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ default: 'Active' })
  status: string;

  @Column('simple-array', { nullable: true })
  documents: string[]; // Stores relative paths to documents

  @Column('jsonb', { nullable: true, default: [] })
  contacts: {
    firstName?: string;
    lastName?: string;
    email?: string;
    contact?: string;
  }[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
