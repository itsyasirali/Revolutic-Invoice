import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Invoice } from '../invoice.entity';

@Injectable()
export class InvoicesGetAllService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
    ) { }

    async getAll(
        userId: number,
        filters?: {
            status?: string;
            customerId?: number;
            startDate?: string;
            endDate?: string;
        },
    ): Promise<Invoice[]> {
        const where: FindOptionsWhere<Invoice> = { userId };

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.customerId) {
            where.customerId = filters.customerId;
        }

        const queryBuilder = this.invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.customer', 'customer')
            .leftJoinAndSelect('invoice.template', 'template')
            .leftJoinAndSelect('invoice.items', 'items')
            .leftJoinAndSelect('items.item', 'itemDetails')
            .where(where)
            .orderBy('invoice.createdAt', 'DESC');

        if (filters?.startDate || filters?.endDate) {
            if (filters.startDate) {
                queryBuilder.andWhere('invoice.dueDate >= :startDate', {
                    startDate: new Date(filters.startDate),
                });
            }
            if (filters.endDate) {
                queryBuilder.andWhere('invoice.dueDate <= :endDate', {
                    endDate: new Date(filters.endDate),
                });
            }
        }

        return queryBuilder.getMany();
    }
}
