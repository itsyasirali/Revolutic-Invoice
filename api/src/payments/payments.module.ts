import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { Payment } from './payment.entity';
import { PaymentAppliedInvoice } from './payment-applied-invoice.entity';
import { PaymentsCreateService } from './services/payments-create.service';
import { PaymentsGetAllService } from './services/payments-get-all.service';
import { PaymentsGetOneService } from './services/payments-get-one.service';
import { PaymentsUpdateService } from './services/payments-update.service';
import { PaymentsDeleteService } from './services/payments-delete.service';
import { PaymentsSendService } from './services/payments-send.service';
import { Invoice } from '../invoices/invoice.entity';
import { Customer } from '../customers/customer.entity';
import { Template } from '../templates/template.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Payment,
            Customer,
            Invoice,
            PaymentAppliedInvoice,
            Template,
        ]),
    ],
    controllers: [PaymentsController],
    providers: [
        PaymentsCreateService,
        PaymentsGetAllService,
        PaymentsGetOneService,
        PaymentsUpdateService,
        PaymentsDeleteService,
        PaymentsSendService,
    ],
    exports: [
        PaymentsCreateService,
        PaymentsGetAllService,
        PaymentsGetOneService,
    ],
})
export class PaymentsModule { }
