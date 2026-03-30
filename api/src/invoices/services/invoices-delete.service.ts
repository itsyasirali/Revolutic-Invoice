import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoice.entity';

@Injectable()
export class InvoicesDeleteService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
    ) { }

    async delete(userId: number, invoiceId: number): Promise<void> {
        const result = await this.invoiceRepository.delete({
            id: invoiceId,
            userId,
        });

        if (result.affected === 0) {
            throw new NotFoundException('Invoice not found or access denied');
        }
    }
}
