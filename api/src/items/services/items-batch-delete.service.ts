import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Item } from '../item.entity';

@Injectable()
export class ItemsBatchDeleteService {
    constructor(
        @InjectRepository(Item)
        private itemsRepository: Repository<Item>,
    ) { }

    async batchDelete(userId: string, itemIds: string[]) {
        try {
            if (!Array.isArray(itemIds) || itemIds.length === 0) {
                throw new BadRequestException('No items provided');
            }

            const parsedUserId = parseInt(userId);
            const parsedItemIds = itemIds.map(id => parseInt(id));

            const result = await this.itemsRepository.delete({
                id: In(parsedItemIds),
                userId: parsedUserId,
            });

            return {
                message: 'Items deleted',
                deleted: result.affected,
            };
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            console.error('Error batch deleting items:', err);
            throw new InternalServerErrorException('Failed to delete items');
        }
    }
}
