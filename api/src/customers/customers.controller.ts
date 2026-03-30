import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Req,
    UploadedFiles,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { CustomersCreateService } from './services/customers-create.service';
import { CustomersUpdateService } from './services/customers-update.service';
import { CustomersGetAllService } from './services/customers-get-all.service';
import { CustomersBatchDeleteService } from './services/customers-batch-delete.service';
import { CustomersBatchUpdateService } from './services/customers-batch-update.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BatchUpdateCustomerDto } from './dto/batch-update-customer.dto';
import { BatchDeleteCustomerDto } from './dto/batch-delete-customer.dto';
import { multerOptions } from '../multer/multer.config';

@Controller('customers')
export class CustomersController {
    constructor(
        private createService: CustomersCreateService,
        private updateService: CustomersUpdateService,
        private getAllService: CustomersGetAllService,
        private batchDeleteService: CustomersBatchDeleteService,
        private batchUpdateService: CustomersBatchUpdateService,
    ) { }

    @Get()
    async getAll(@Req() req: Request) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.getAllService.getAll(userId);
    }

    @Post()
    @UseInterceptors(FilesInterceptor('documents', 10, multerOptions))
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(
        @Req() req: Request,
        @Body() createCustomerDto: CreateCustomerDto,
        @UploadedFiles() files: any[],
    ) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.createService.create(userId, createCustomerDto, files || []);
    }

    @Put('batch-update')
    @UsePipes(new ValidationPipe({ transform: true }))
    async batchUpdate(@Req() req: Request, @Body() batchUpdateCustomerDto: BatchUpdateCustomerDto) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.batchUpdateService.batchUpdate(userId, batchUpdateCustomerDto.status, batchUpdateCustomerDto.customers);
    }

    @Delete('batch-delete')
    @UsePipes(new ValidationPipe({ transform: true }))
    async batchDelete(@Req() req: Request, @Body() batchDeleteCustomerDto: BatchDeleteCustomerDto) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.batchDeleteService.batchDelete(userId, batchDeleteCustomerDto.customers);
    }

    @Put(':id')
    @UseInterceptors(FilesInterceptor('documents', 10, multerOptions))
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
        @UploadedFiles() files: any[],
    ) {
        const userId = (req as any).user?.id || (req as any).session?.user?.id;
        return this.updateService.update(userId, id, updateCustomerDto, files || []);
    }
}





