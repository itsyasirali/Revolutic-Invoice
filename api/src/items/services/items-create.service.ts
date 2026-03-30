import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../item.entity';
import { CreateItemDto } from '../dto/create-item.dto';

@Injectable()
export class ItemsCreateService {
    constructor(
        @InjectRepository(Item)
        private itemsRepository: Repository<Item>,
    ) { }

    async create(userId: string, createItemDto: CreateItemDto) {
        try {
            const newItem = this.itemsRepository.create({
                ...createItemDto,
                userId: parseInt(userId),
                status: createItemDto.status || 'Active',
            });

            await this.itemsRepository.save(newItem);
            return { message: 'Item created successfully', item: newItem };
        } catch (error) {
            console.error('Error creating item:', error);
            throw new InternalServerErrorException('Failed to create item');
        }
    }
}
