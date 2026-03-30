import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from '../payment.entity';

@Injectable()
export class PaymentsGetAllService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
    ) { }

    async findAll(
        userId: number,
        query: { customerId?: number; startDate?: string; endDate?: string },
    ): Promise<Payment[]> {
        const where: any = { userId };

        if (query.customerId) {
            where.customerId = query.customerId;
        }

        if (query.startDate && query.endDate) {
            where.paymentDate = Between(new Date(query.startDate), new Date(query.endDate));
        }

        return this.paymentRepository.find({
            where,
            relations: ['customer', 'appliedInvoices', 'appliedInvoices.invoice'],
            order: { createdAt: 'DESC' },
        });
    }
}
