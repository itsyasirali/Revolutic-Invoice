import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../template.entity';

@Injectable()
export class TemplatesGetAllService {
    constructor(
        @InjectRepository(Template)
        private templateRepository: Repository<Template>,
    ) { }

    async getAll(userId: number): Promise<Template[]> {
        return this.templateRepository.find({
            where: { userId },
            order: {
                isDefault: 'DESC',
                createdAt: 'DESC',
            },
        });
    }
}
