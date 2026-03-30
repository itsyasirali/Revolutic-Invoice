import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Payment } from '../payment.entity';
import { PaymentAppliedInvoice } from '../payment-applied-invoice.entity';
import { Invoice } from '../../invoices/invoice.entity';
import { Customer } from '../../customers/customer.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentsCreateService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        private dataSource: DataSource,
    ) { }

    /**
     * Validates that manually applied invoices follow sequential payment rule:
     * All chronologically earlier invoices must be fully paid (remaining = 0)
     * before payment can be applied to later invoices.
     */
    private async validateSequentialPayment(
        queryRunner: any,
        userId: number,
        customerId: number,
        appliedInvoices: { invoiceId: number; amount: number }[]
    ): Promise<void> {
        // Get all unpaid/partially paid invoices for this customer, in chronological order
        const allInvoices = await queryRunner.manager.find(Invoice, {
            where: {
                userId,
                customerId,
                status: In(['Sent', 'Partially Paid', 'Overdue']),
            },
            order: { dueDate: 'ASC', invoiceDate: 'ASC' },
        });

        // For each invoice being paid, check that all earlier invoices are fully paid
        for (const application of appliedInvoices) {
            const invoiceIndex = allInvoices.findIndex(inv => inv.id === application.invoiceId);

            if (invoiceIndex === -1) {
                throw new BadRequestException(`Invoice ${application.invoiceId} not found or already paid`);
            }

            // Check all invoices before this one
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

    async create(userId: number, createPaymentDto: CreatePaymentDto): Promise<Payment> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { customerId, appliedInvoices, ...paymentData } = createPaymentDto;

            // 1. Verify Customer
            const customer = await this.customerRepository.findOne({
                where: { id: customerId, userId },
            });

            if (!customer) {
                throw new NotFoundException(`Customer with ID ${customerId} not found`);
            }

            // 2. Generate Payment Number if not provided
            let paymentNumber = paymentData.paymentNumber;
            if (!paymentNumber) {
                const lastPayment = await this.paymentRepository.findOne({
                    where: { userId },
                    order: { paymentNumber: 'DESC' },
                });
                paymentNumber = (lastPayment?.paymentNumber || 0) + 1;
            }

            // 3. Prepare Payment Object
            const payment = this.paymentRepository.create({
                ...paymentData,
                userId,
                customerId,
                paymentNumber,
                customerDisplayName: paymentData.customerDisplayName || customer.displayName || customer.companyName || '',
                customerEmail: paymentData.customerEmail || customer.contacts?.[0]?.email || '',
                currency: paymentData.currency || customer.currency || 'PKR',
                appliedInvoices: [],
            });

            // 4. Handle Applied Invoices Logic (Auto-allocation or Specific)
            let invoicesToUpdate: { invoiceId: number; amount: number }[] = [];

            if (appliedInvoices && appliedInvoices.length > 0) {
                // Validate sequential payment rule
                await this.validateSequentialPayment(queryRunner, userId, customerId, appliedInvoices);
                // Validate provided invoices
                invoicesToUpdate = appliedInvoices;
            } else {
                // Auto-allocate across unpaid invoices
                const unpaidInvoices = await this.invoiceRepository.find({
                    where: {
                        userId,
                        customerId,
                        status: In(['Sent', 'Partially Paid', 'Overdue']),
                    },
                    order: { dueDate: 'ASC', invoiceDate: 'ASC' },
                });

                let remainingAmount = payment.amountReceived;
                for (const invoice of unpaidInvoices) {
                    if (remainingAmount <= 0) break;
                    if (invoice.remaining > 0) {
                        const amountToApply = Math.min(remainingAmount, Number(invoice.remaining));
                        if (amountToApply > 0) {
                            invoicesToUpdate.push({
                                invoiceId: invoice.id,
                                amount: amountToApply,
                            });
                            remainingAmount -= amountToApply;
                        }
                    }
                }
            }

            // 5. Create PaymentAppliedInvoice entities and Update Invoices
            const paymentAppliedEntities: PaymentAppliedInvoice[] = [];

            for (const item of invoicesToUpdate) {
                const invoice = await queryRunner.manager.findOne(Invoice, {
                    where: { id: item.invoiceId, userId },
                });

                if (!invoice) continue;

                const amount = Number(item.amount);

                // Update Invoice
                invoice.received = Number(invoice.received) + amount;
                invoice.remaining = Math.max(0, Number(invoice.total) - invoice.received);

                if (invoice.remaining <= 0) {
                    invoice.status = 'Paid';
                } else if (invoice.received > 0) {
                    invoice.status = 'Partially Paid';
                }

                await queryRunner.manager.save(Invoice, invoice);

                // Create Join Record
                const applied = new PaymentAppliedInvoice();
                applied.invoice = invoice;
                applied.amount = amount;
                paymentAppliedEntities.push(applied);
            }

            // 6. Save Payment with Relations
            payment.appliedInvoices = paymentAppliedEntities;
            const savedPayment = await queryRunner.manager.save(Payment, payment);

            // Update receivables
            // Recalculating customer receivables could be done here if needed

            await queryRunner.commitTransaction();

            return savedPayment;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error creating payment:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
