import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../template.entity';

@Injectable()
export class TemplatesDeleteService {
    constructor(
        @InjectRepository(Template)
        private templateRepository: Repository<Template>,
    ) { }

    async delete(userId: number, templateId: number): Promise<void> {
        const template = await this.templateRepository.findOne({
            where: { id: templateId, userId },
        });

        if (!template) {
            throw new NotFoundException(`Template with ID ${templateId} not found`);
        }

        await this.templateRepository.remove(template);
    }
}
