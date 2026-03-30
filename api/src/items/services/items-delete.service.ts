import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../item.entity';

@Injectable()
export class ItemsDeleteService {
    constructor(
        @InjectRepository(Item)
        private itemsRepository: Repository<Item>,
    ) { }

    async delete(userId: string, id: string) {
        try {
            const parsedId = parseInt(id);
            const parsedUserId = parseInt(userId);

            const result = await this.itemsRepository.delete({ id: parsedId, userId: parsedUserId });

            if (result.affected === 0) {
                throw new NotFoundException('Item not found');
            }

            return { message: 'Item deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error deleting item:', error);
            throw new InternalServerErrorException('Failed to delete item');
        }
    }
}
