import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../item.entity';
import { UpdateItemDto } from '../dto/update-item.dto';

@Injectable()
export class ItemsUpdateService {
    constructor(
        @InjectRepository(Item)
        private itemsRepository: Repository<Item>,
    ) { }

    async update(userId: string, id: string, updateItemDto: UpdateItemDto) {
        try {
            const parsedId = parseInt(id);
            const parsedUserId = parseInt(userId);

            const existingItem = await this.itemsRepository.findOne({ where: { id: parsedId, userId: parsedUserId } });
            if (!existingItem) {
                throw new NotFoundException('Item not found');
            }

            Object.assign(existingItem, updateItemDto);

            await this.itemsRepository.save(existingItem);

            return { message: 'Item updated successfully', item: existingItem };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error updating item:', error);
            throw new InternalServerErrorException('Failed to update item');
        }
    }
}
