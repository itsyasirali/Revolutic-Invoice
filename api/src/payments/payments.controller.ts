import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    Request,
    Query,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsCreateService } from './services/payments-create.service';
import { PaymentsGetAllService } from './services/payments-get-all.service';
import { PaymentsGetOneService } from './services/payments-get-one.service';
import { PaymentsUpdateService } from './services/payments-update.service';
import { PaymentsDeleteService } from './services/payments-delete.service';
import { PaymentsSendService } from './services/payments-send.service';
import { SendPaymentDto } from './dto/send-payment.dto';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly createService: PaymentsCreateService,
        private readonly getAllService: PaymentsGetAllService,
        private readonly getOneService: PaymentsGetOneService,
        private readonly updateService: PaymentsUpdateService,
        private readonly deleteService: PaymentsDeleteService,
        private readonly sendService: PaymentsSendService,
    ) { }

    @Post()
    create(@Request() req, @Body() createPaymentDto: CreatePaymentDto) {
        const userId = req.user?.id || req.session?.user?.id;
        return this.createService.create(userId, createPaymentDto);
    }

    @Get()
    findAll(
        @Request() req,
        @Query('customerId') customerId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const userId = req.user?.id || req.session?.user?.id;
        return this.getAllService.findAll(userId, {
            customerId: customerId ? Number(customerId) : undefined,
            startDate,
            endDate,
        });
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        const userId = req.user?.id || req.session?.user?.id;
        return this.getOneService.findOne(userId, +id);
    }

    @Put(':id')
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updatePaymentDto: UpdatePaymentDto,
    ) {
        const userId = req.user?.id || req.session?.user?.id;
        return this.updateService.update(userId, +id, updatePaymentDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        const userId = req.user?.id || req.session?.user?.id;
        return this.deleteService.delete(userId, +id);
    }

    @Post(':id/send')
    send(
        @Request() req,
        @Param('id') id: string,
        @Body() sendPaymentDto: SendPaymentDto,
    ) {
        const userId = req.user?.id || req.session?.user?.id;
        return this.sendService.send(userId, +id, sendPaymentDto);
    }
}
