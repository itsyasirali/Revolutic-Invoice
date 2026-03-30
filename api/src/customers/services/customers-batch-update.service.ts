import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Customer } from '../customer.entity';

@Injectable()
export class CustomersBatchUpdateService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
    ) { }

    async batchUpdate(userId: string, status: string, customerIds: string[]) {
        try {
            if (!status || (status !== 'Active' && status !== 'inActive')) {
                throw new BadRequestException('Invalid status value');
            }
            if (!Array.isArray(customerIds) || customerIds.length === 0) {
                throw new BadRequestException('No customers provided');
            }

            // Convert customerIds to unique list if needed, or In() handles it.
            const parsedUserId = parseInt(userId);
            const parsedCustomerIds = customerIds.map(id => parseInt(id));

            const result = await this.customersRepository.update(
                { id: In(parsedCustomerIds), userId: parsedUserId },
                { status }
            );

            return {
                message: 'Status updated',
                matched: result.affected, // TypeORM returns affected. precise "matched" vs "modified" depends on driver. 
                // Postgres update returns number of affected rows.
                modified: result.affected,
            };
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            console.error('Error batch updating customers:', err);
            throw new InternalServerErrorException('Failed to update customers');
        }
    }
}
