import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Req,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { ItemsCreateService } from './services/items-create.service';
import { ItemsUpdateService } from './services/items-update.service';
import { ItemsGetAllService } from './services/items-get-all.service';
import { ItemsDeleteService } from './services/items-delete.service';
import { ItemsBatchUpdateService } from './services/items-batch-update.service';
import { ItemsBatchDeleteService } from './services/items-batch-delete.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { BatchUpdateItemDto } from './dto/batch-update-item.dto';
import { BatchDeleteItemDto } from './dto/batch-delete-item.dto';

@Controller('items')
export class ItemsController {
    constructor(
        private createService: ItemsCreateService,
        private updateService: ItemsUpdateService,
        private getAllService: ItemsGetAllService,
        private deleteService: ItemsDeleteService,
        private batchUpdateService: ItemsBatchUpdateService,
        private batchDeleteService: ItemsBatchDeleteService,
    ) { }

    @Get()
    async getAll(@Req() req: Request) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.getAllService.getAll(userId);
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Req() req: Request, @Body() createItemDto: CreateItemDto) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.createService.create(userId, createItemDto);
    }

    @Put('batch-update')
    @UsePipes(new ValidationPipe({ transform: true }))
    async batchUpdate(@Req() req: Request, @Body() batchUpdateItemDto: BatchUpdateItemDto) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.batchUpdateService.batchUpdate(userId, batchUpdateItemDto.status, batchUpdateItemDto.items);
    }

    @Delete('batch-delete')
    @UsePipes(new ValidationPipe({ transform: true }))
    async batchDelete(@Req() req: Request, @Body() batchDeleteItemDto: BatchDeleteItemDto) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.batchDeleteService.batchDelete(userId, batchDeleteItemDto.items);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateItemDto: UpdateItemDto,
    ) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.updateService.update(userId, id, updateItemDto);
    }

    @Delete(':id')
    async delete(@Req() req: Request, @Param('id') id: string) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.deleteService.delete(userId, id);
    }
}
