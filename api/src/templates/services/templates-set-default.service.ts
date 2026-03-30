import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../template.entity';

@Injectable()
export class TemplatesSetDefaultService {
    constructor(
        @InjectRepository(Template)
        private templateRepository: Repository<Template>,
    ) { }

    async setDefault(userId: number, templateId: number): Promise<Template> {
        // Find the template to set as default
        const template = await this.templateRepository.findOne({
            where: { id: templateId, userId },
        });

        if (!template) {
            throw new NotFoundException(`Template with ID ${templateId} not found`);
        }

        // Set all user's templates to not default
        await this.templateRepository.update(
            { userId },
            { isDefault: false },
        );

        // Set the target template as default
        template.isDefault = true;
        return this.templateRepository.save(template);
    }
}
