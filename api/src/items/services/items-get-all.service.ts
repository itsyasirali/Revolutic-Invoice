import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../item.entity';

@Injectable()
export class ItemsGetAllService {
    constructor(
        @InjectRepository(Item)
        private itemsRepository: Repository<Item>,
    ) { }

    async getAll(userId: string) {
        try {
            const parsedUserId = parseInt(userId);
            const items = await this.itemsRepository.find({
                where: { userId: parsedUserId },
                order: { createdAt: 'DESC' },
            });
            return { items };
        } catch (error) {
            console.error('Error fetching items:', error);
            throw new InternalServerErrorException('Failed to fetch items');
        }
    }
}
