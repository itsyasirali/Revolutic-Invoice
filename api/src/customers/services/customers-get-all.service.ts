import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer.entity';
import { Invoice } from '../../invoices/invoice.entity';
import { Payment } from '../../payments/payment.entity';

@Injectable()
export class CustomersGetAllService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        @InjectRepository(Invoice)
        private invoicesRepository: Repository<Invoice>,
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
    ) { }

    async getAll(userId: string) {
        try {
            const parsedUserId = parseInt(userId);
            const customers = await this.customersRepository.find({
                where: { userId: parsedUserId },
                order: { createdAt: 'DESC' },
            });

            const invoices = await this.invoicesRepository.find({ where: { userId: parsedUserId } });
            const payments = await this.paymentsRepository.find({ where: { userId: parsedUserId }, order: { paymentDate: 'DESC' } });

            const customersWithFinancials = customers.map((customer) => {
                const customerObj = { ...customer };
                const customerId = customer.id;

                const customerInvoices = invoices.filter(
                    (inv) => inv.customerId === customerId
                );

                const customerPayments = payments.filter(
                    (payment) => payment.customerId === customerId
                );

                let received = 0;
                let remaining = 0;

                customerInvoices.forEach((invoice) => {
                    const status = (invoice.status || '').toLowerCase();
                    if (status === 'draft' || status === 'cancelled') return;

                    const invoiceTotal = parseFloat(invoice.total?.toString() || '0');
                    const invoiceReceived = parseFloat(invoice.received?.toString() || '0');
                    let invoiceRemaining = parseFloat(invoice.remaining?.toString() || '0');

                    if (invoice.remaining == null) {
                        invoiceRemaining = Math.max(0, invoiceTotal - invoiceReceived);
                    }

                    received += invoiceReceived;
                    remaining += invoiceRemaining;
                });

                return {
                    ...customerObj,
                    receivables: remaining,
                    unusedCredits: received,
                    invoices: customerInvoices,
                    payments: customerPayments.map((payment) => {
                        const appliedWithDetails = (payment.appliedInvoices || []).map((applied: any) => {
                            const matchedInvoice = invoices.find(inv => inv.id === applied.invoiceId);
                            return {
                                ...applied,
                                invoiceNumber: matchedInvoice?.invoiceNumber || applied.invoiceNumber || 'Unknown Invoice',
                                invoiceAmount: matchedInvoice?.total || applied.amount || 0,
                            };
                        });

                        return {
                            ...payment,
                            appliedInvoices: appliedWithDetails,
                        }
                    }),
                };
            });

            return { customers: customersWithFinancials };
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw new InternalServerErrorException('Failed to fetch customers');
        }
    }
}
