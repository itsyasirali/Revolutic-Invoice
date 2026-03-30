import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../payment.entity';

@Injectable()
export class PaymentsGetOneService {
    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
    ) { }

    async findOne(userId: number, id: number): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { id, userId },
            relations: ['customer', 'appliedInvoices', 'appliedInvoices.invoice'],
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }
}
