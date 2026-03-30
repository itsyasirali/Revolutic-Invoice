import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from '../payment.entity';
import { Invoice } from '../../invoices/invoice.entity';

@Injectable()
export class PaymentsDeleteService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        private dataSource: DataSource,
    ) { }

    async delete(userId: number, id: number): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const payment = await queryRunner.manager.findOne(Payment, {
                where: { id, userId },
                relations: ['appliedInvoices', 'appliedInvoices.invoice'],
            });

            if (!payment) {
                throw new NotFoundException('Payment not found');
            }

            // Revert Invoice Statuses
            for (const applied of payment.appliedInvoices) {
                const invoice = applied.invoice;
                if (invoice) {
                    const amount = Number(applied.amount);
                    invoice.received = Math.max(0, Number(invoice.received) - amount);
                    invoice.remaining = Number(invoice.total) - invoice.received;

                    if (invoice.remaining >= invoice.total) { // Fully unpaid or close to it
                        invoice.status = 'Sent'; // Default back to sent if unpaid? Or Overdue depending on date.
                        // Or just check if remaining > 0 -> Partially Paid, if remaining == total -> Sent/Overdue

                        // Simple logic reset:
                        if (invoice.received === 0) {
                            const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date();
                            invoice.status = isOverdue ? 'Overdue' : 'Sent';
                        } else {
                            invoice.status = 'Partially Paid';
                        }
                    } else if (invoice.remaining > 0) {
                        invoice.status = 'Partially Paid';
                    }
                    // If still 0 remaining, it stays Paid, but we just subtracted so unlikely unless negative amount.

                    await queryRunner.manager.save(Invoice, invoice);
                }
            }

            await queryRunner.manager.remove(Payment, payment);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
