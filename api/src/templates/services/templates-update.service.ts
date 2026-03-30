import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../template.entity';
import { UpdateTemplateDto } from '../dto/update-template.dto';

@Injectable()
export class TemplatesUpdateService {
    constructor(
        @InjectRepository(Template)
        private templateRepository: Repository<Template>,
    ) { }

    async update(
        userId: number,
        id: number,
        updateTemplateDto: UpdateTemplateDto,
        logoFile?: any,
    ): Promise<Template> {
        // Find existing template
        const template = await this.templateRepository.findOne({
            where: { id, userId },
        });

        if (!template) {
            throw new NotFoundException(`Template with ID ${id} not found`);
        }

        // Update logoUrl if new file was uploaded
        if (logoFile) {
            updateTemplateDto.logoUrl = `/uploads/templates/${logoFile.filename}`;
        }

        // Sanitize DTO to prevent accidental ID overwrites/creation
        if ('id' in updateTemplateDto) delete (updateTemplateDto as any).id;
        if ('userId' in updateTemplateDto) delete (updateTemplateDto as any).userId;

        // Merge updates into existing entity
        Object.assign(template, updateTemplateDto);

        // Explicitly enforce the ID to ensure TypeORM performs an UPDATE, not INSERT
        template.id = Number(id);

        // Save and return
        return this.templateRepository.save(template);
    }
}
