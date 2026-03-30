import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Req,
    UploadedFile,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { TemplatesGetAllService } from './services/templates-get-all.service';
import { TemplatesGetOneService } from './services/templates-get-one.service';
import { TemplatesCreateService } from './services/templates-create.service';
import { TemplatesUpdateService } from './services/templates-update.service';
import { TemplatesDeleteService } from './services/templates-delete.service';
import { TemplatesSetDefaultService } from './services/templates-set-default.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { multerOptions } from '../multer/multer.config';

@Controller('templates')
export class TemplatesController {
    constructor(
        private getAllService: TemplatesGetAllService,
        private getOneService: TemplatesGetOneService,
        private createService: TemplatesCreateService,
        private updateService: TemplatesUpdateService,
        private deleteService: TemplatesDeleteService,
        private setDefaultService: TemplatesSetDefaultService,
    ) { }

    @Get()
    async getAll(@Req() req: Request) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.getAllService.getAll(userId);
    }

    @Get(':id')
    async getOne(@Req() req: Request, @Param('id') id: string) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.getOneService.getOne(userId, Number(id));
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('logo', multerOptions))
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(
        @Req() req: Request,
        @Body() createTemplateDto: CreateTemplateDto,
        @UploadedFile() file?: any,
    ) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        const template = await this.createService.create(userId, createTemplateDto, file);
        return {
            message: 'Template created successfully',
            template,
        };
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('logo', multerOptions))
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateTemplateDto: UpdateTemplateDto,
        @UploadedFile() file?: any,
    ) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        const template = await this.updateService.update(userId, Number(id), updateTemplateDto, file);
        return {
            message: 'Template updated successfully',
            template,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Req() req: Request, @Param('id') id: string) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        await this.deleteService.delete(userId, Number(id));
        return {
            message: 'Template deleted successfully',
        };
    }

    @Put(':id/set-default')
    async setDefault(@Req() req: Request, @Param('id') id: string) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        const template = await this.setDefaultService.setDefault(userId, Number(id));
        return {
            message: 'Template set as default successfully',
            template,
        };
    }
}
