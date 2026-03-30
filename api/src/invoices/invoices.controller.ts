import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { InvoicesCreateService } from './services/invoices-create.service';
import { InvoicesUpdateService } from './services/invoices-update.service';
import { InvoicesGetAllService } from './services/invoices-get-all.service';
import { InvoicesDeleteService } from './services/invoices-delete.service';
import { InvoicesSendService } from './services/invoices-send.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { SendInvoiceDto } from './dto/send-invoice.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly createService: InvoicesCreateService,
        private readonly updateService: InvoicesUpdateService,
        private readonly getAllService: InvoicesGetAllService,
        private readonly deleteService: InvoicesDeleteService,
        private readonly sendService: InvoicesSendService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Req() req: any, @Body() createInvoiceDto: CreateInvoiceDto) {
        const userId = req.user?.id || req.session?.user?.id;
        return this.createService.create(userId, createInvoiceDto);
    }

    @Get()
    async findAll(
        @Req() req: any,
        @Query('status') status?: string,
        @Query('customerId') customerId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const userId = req.user?.id || req.session?.user?.id;
        return this.getAllService.getAll(userId, {
            status,
            customerId: customerId ? Number(customerId) : undefined,
            startDate,
            endDate,
        });
    }

    @Put(':id')
    async update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() updateInvoiceDto: UpdateInvoiceDto,
    ) {
        const userId = req.user?.id || req.session?.user?.id;
        return this.updateService.update(userId, Number(id), updateInvoiceDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Req() req: any, @Param('id') id: string) {
        const userId = req.user?.id || req.session?.user?.id;
        await this.deleteService.delete(userId, Number(id));
        return { message: 'Invoice deleted successfully' };
    }

    @Post(':id/send')
    @HttpCode(HttpStatus.OK)
    async send(
        @Req() req: any,
        @Param('id') id: string,
        @Body() sendInvoiceDto: SendInvoiceDto,
    ) {
        let invoiceId = Number(id);
        const userId = req.user?.id || req.session?.user?.id;

        // Handle sending 'draft' invoice (unsaved)
        if (id === 'draft' || isNaN(invoiceId)) {
            if (!sendInvoiceDto.invoiceData) {
                throw new Error('Invoice data is required for sending draft');
            }
            // Create the invoice first
            const newInvoice = await this.createService.create(userId, sendInvoiceDto.invoiceData);
            invoiceId = Number(newInvoice.id);
        }

        const invoice = await this.sendService.send(
            userId,
            invoiceId,
            sendInvoiceDto,
        );
        return {
            message: 'Invoice email sent successfully',
            invoice,
            emailSent: true,
        };
    }
}
