import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Customer } from '../customer.entity';
import { CustomersHelperService } from './customers-helper.service';

@Injectable()
export class CustomersBatchDeleteService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        private helperService: CustomersHelperService,
    ) { }

    async batchDelete(userId: string, customerIds: string[]) {
        try {
            if (!Array.isArray(customerIds) || customerIds.length === 0) {
                throw new BadRequestException('No customers provided');
            }

            const parsedUserId = parseInt(userId);
            const parsedCustomerIds = customerIds.map(id => parseInt(id));

            const docs = await this.customersRepository.find({
                where: { id: In(parsedCustomerIds), userId: parsedUserId },
                select: ['documents', 'id'],
            });

            if (docs.length === 0) {
                throw new BadRequestException('No valid parameters provided'); // Matching "No valid customer IDs provided" sentiment
            }

            for (const doc of docs) {
                for (const path of doc.documents || []) {
                    try {
                        this.helperService.deleteFileIfExists(path);
                    } catch (err) {
                        console.warn(`Could not delete file: ${path}`, err);
                    }
                }
            }

            const idsToDelete = docs.map(d => d.id);
            const result = await this.customersRepository.delete({ id: In(idsToDelete), userId: parsedUserId });

            return {
                message: 'Customers deleted successfully',
                deletedCount: result.affected,
                ids: idsToDelete,
            };
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            console.error('Error batch deleting customers:', err);
            throw new InternalServerErrorException('Failed to delete customers');
        }
    }
}
