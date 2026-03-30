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
import { PaymentAppliedInvoice } from './payment-applied-invoice.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  paymentDate: Date;

  @Column({ nullable: true })
  paymentNumber: number;

  @Column({ nullable: true })
  referenceNo: string;

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

  @Column()
  customerDisplayName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @ManyToOne(() => Template, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column({ nullable: true })
  templateId: number;

  @Column()
  paymentMode: string;

  @Column({ default: 'Draft' })
  status: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amountReceived: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  bankCharges: number;

  @Column({ default: false })
  tdsApplied: boolean;

  @Column({ default: 'PKR' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(
    () => PaymentAppliedInvoice,
    (applied: PaymentAppliedInvoice): Payment => applied.payment,
    {
      cascade: true,
    },
  )
  appliedInvoices: PaymentAppliedInvoice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
