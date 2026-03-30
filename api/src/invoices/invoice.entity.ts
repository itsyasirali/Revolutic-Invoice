import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Customer } from '../customers/customer.entity';
import { Template } from '../templates/template.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  invoiceNumber: string;

  @Column()
  invoiceDate: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  subTotal: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ default: 'PKR' })
  currency: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  received: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  remaining: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  previousRemaining: number;

  @Column({ default: 'Draft' })
  status: string; // 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled'

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  recipients: string[];

  @Column('float', { default: 0 })
  discountPercent: number;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column()
  customerId: number;

  @ManyToOne(() => Template, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column({ nullable: true })
  templateId: number | null;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
