import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { Invoice } from '../invoices/invoice.entity';

@Entity('payment_applied_invoices')
export class PaymentAppliedInvoice {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(
    () => Payment,
    (payment: Payment): PaymentAppliedInvoice[] => payment.appliedInvoices,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column()
  paymentId: number;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column()
  invoiceId: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;
}
