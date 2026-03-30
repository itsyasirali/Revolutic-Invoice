import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../template.entity';
import { CreateTemplateDto } from '../dto/create-template.dto';

@Injectable()
export class TemplatesCreateService {
    constructor(
        @InjectRepository(Template)
        private templateRepository: Repository<Template>,
    ) { }

    async create(
        userId: number,
        createTemplateDto: CreateTemplateDto,
        logoFile?: any,
    ): Promise<Template> {
        // Validate template name
        if (!createTemplateDto.templateName || createTemplateDto.templateName.trim() === '') {
            throw new BadRequestException('Template name is required');
        }

        // Check if template name already exists for this user
        const existingTemplate = await this.templateRepository.findOne({
            where: {
                userId,
                templateName: createTemplateDto.templateName,
            },
        });

        if (existingTemplate) {
            throw new BadRequestException('A template with this name already exists');
        }

        // Prepare template data
        const templateData: Partial<Template> = {
            ...createTemplateDto,
            userId,
        };

        // Set logoUrl if file was uploaded
        if (logoFile) {
            templateData.logoUrl = `/uploads/templates/${logoFile.filename}`;
        }

        // Create and save template
        const template: Template = this.templateRepository.create(templateData);
        return await this.templateRepository.save(template);
    }
}
