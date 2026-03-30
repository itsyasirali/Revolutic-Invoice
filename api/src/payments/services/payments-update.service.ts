import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Payment } from '../payment.entity';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { Invoice } from '../../invoices/invoice.entity';
import { PaymentAppliedInvoice } from '../payment-applied-invoice.entity';
import { Customer } from '../../customers/customer.entity';

@Injectable()
export class PaymentsUpdateService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        private dataSource: DataSource,
    ) { }
    private async validateSequentialPayment(
        queryRunner: any,
        userId: number,
        customerId: number,
        appliedInvoices: { invoiceId: number; amount: number }[]
    ): Promise<void> {
        const allInvoices = await queryRunner.manager.find(Invoice, {
            where: {
                userId,
                customerId,
                status: In(['Sent', 'Partially Paid', 'Overdue']),
            },
            order: { dueDate: 'ASC', invoiceDate: 'ASC' },
        });

        for (const application of appliedInvoices) {
            const invoiceIndex = allInvoices.findIndex(inv => inv.id === application.invoiceId);

            if (invoiceIndex === -1) {
                throw new NotFoundException(`Invoice ${application.invoiceId} not found or already paid`);
            }

            for (let i = 0; i < invoiceIndex; i++) {
                const earlierInvoice = allInvoices[i];
                if (earlierInvoice.remaining > 0) {
                    throw new BadRequestException(
                        `Cannot apply payment to Invoice #${allInvoices[invoiceIndex].invoiceNumber}. ` +
                        `Earlier invoice #${earlierInvoice.invoiceNumber} (Due: ${earlierInvoice.dueDate}) ` +
                        `still has an outstanding balance of ${earlierInvoice.remaining}. ` +
                        `Please pay invoices in chronological order.`
                    );
                }
            }
        }
    }

    async update(userId: number, id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
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

            // If amount or appliedInvoices changed, we need to revert old and apply new
            // For simplicity, we can do full revert and re-apply if significant fields change.
            const needsReallocation =
                updatePaymentDto.amountReceived !== undefined ||
                updatePaymentDto.appliedInvoices !== undefined ||
                (updatePaymentDto.customerId && updatePaymentDto.customerId !== payment.customerId);

            if (needsReallocation) {
                // 1. Revert Old allocations
                for (const applied of payment.appliedInvoices) {
                    const invoice = applied.invoice;
                    if (invoice) {
                        invoice.received = Math.max(0, Number(invoice.received) - Number(applied.amount));
                        invoice.remaining = Number(invoice.total) - invoice.received;
                        if (invoice.received === 0) {
                            const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date();
                            invoice.status = isOverdue ? 'Overdue' : 'Sent';
                        } else {
                            invoice.status = 'Partially Paid';
                        }
                        await queryRunner.manager.save(Invoice, invoice);
                    }
                }
                // Delete old applied records
                await queryRunner.manager.delete(PaymentAppliedInvoice, { paymentId: payment.id });
                payment.appliedInvoices = []; // clear in memory
            }

            // 2. Update Payment Fields
            const { appliedInvoices, customerId, ...fieldsToUpdate } = updatePaymentDto;

            Object.assign(payment, fieldsToUpdate);

            if (customerId) {
                const customer = await this.customerRepository.findOne({ where: { id: customerId, userId } });
                if (!customer) throw new NotFoundException('Customer not found');
                payment.customerId = customerId;
                payment.customerDisplayName = fieldsToUpdate.customerDisplayName || customer.displayName || customer.companyName || '';
                payment.customerEmail = fieldsToUpdate.customerEmail || customer.contacts?.[0]?.email || '';
            }

            // 3. Apply New Allocations (if reallocated)
            if (needsReallocation) {
                // Determine new applied amounts
                let invoicesToUpdate: { invoiceId: number; amount: number }[] = [];

                if (appliedInvoices && appliedInvoices.length > 0) {
                    // Validate sequential payment rule
                    await this.validateSequentialPayment(queryRunner, userId, payment.customerId, appliedInvoices);
                    invoicesToUpdate = appliedInvoices;
                } else {
                    // Auto allocate whatever the NEW amount is
                    const unpaidInvoices = await queryRunner.manager.find(Invoice, {
                        where: {
                            userId,
                            customerId: payment.customerId,
                            status: In(['Sent', 'Partially Paid', 'Overdue']),
                        },
                        order: { dueDate: 'ASC', invoiceDate: 'ASC' },
                    });

                    let remainingAmount = Number(payment.amountReceived);
                    for (const invoice of unpaidInvoices) {
                        if (remainingAmount <= 0) break;
                        if (invoice.remaining > 0) {
                            const amountToApply = Math.min(remainingAmount, Number(invoice.remaining));
                            if (amountToApply > 0) {
                                invoicesToUpdate.push({
                                    invoiceId: invoice.id,
                                    amount: amountToApply
                                });
                                remainingAmount -= amountToApply;
                            }
                        }
                    }
                }

                // Execute Application
                const newAppliedEntities: PaymentAppliedInvoice[] = [];
                for (const item of invoicesToUpdate) {
                    const invoice = await queryRunner.manager.findOne(Invoice, { where: { id: item.invoiceId } }); // checking userId implicit or explicit? better explicit
                    if (!invoice || invoice.userId !== userId) continue;

                    invoice.received = Number(invoice.received) + Number(item.amount);
                    invoice.remaining = Math.max(0, Number(invoice.total) - invoice.received);
                    if (invoice.remaining <= 0) {
                        invoice.status = 'Paid';
                    } else if (invoice.received > 0) {
                        invoice.status = 'Partially Paid';
                    }
                    await queryRunner.manager.save(Invoice, invoice);

                    const applied = new PaymentAppliedInvoice();
                    applied.payment = payment; // ensure link
                    applied.invoice = invoice;
                    applied.amount = Number(item.amount);
                    newAppliedEntities.push(applied);
                }
                // We don't push to payment.appliedInvoices yet because save might need them separate or cascaded. 
                // Since we deleted old ones, we can just save these new entities? 
                // Alternatively, attach to payment and save payment.
                payment.appliedInvoices = newAppliedEntities;
            }

            const savedPayment = await queryRunner.manager.save(Payment, payment);
            await queryRunner.commitTransaction();
            return savedPayment;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
