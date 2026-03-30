import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Item } from '../item.entity';

@Injectable()
export class ItemsBatchUpdateService {
    constructor(
        @InjectRepository(Item)
        private itemsRepository: Repository<Item>,
    ) { }

    async batchUpdate(userId: string, status: string, itemIds: string[]) {
        try {
            if (!status || (status !== 'Active' && status !== 'inActive')) {
                throw new BadRequestException('Invalid status value');
            }
            if (!Array.isArray(itemIds) || itemIds.length === 0) {
                throw new BadRequestException('No items provided');
            }

            const parsedUserId = parseInt(userId);
            const parsedItemIds = itemIds.map(id => parseInt(id));

            const result = await this.itemsRepository.update(
                { id: In(parsedItemIds), userId: parsedUserId },
                { status }
            );

            return {
                message: 'Status updated',
                modified: result.affected,
            };
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            console.error('Error batch updating items:', err);
            throw new InternalServerErrorException('Failed to update items');
        }
    }
}
