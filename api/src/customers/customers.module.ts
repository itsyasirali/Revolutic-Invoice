import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { Customer } from './customer.entity';
import { Invoice } from '../invoices/invoice.entity';
import { Payment } from '../payments/payment.entity';

import { CustomersCreateService } from './services/customers-create.service';
import { CustomersUpdateService } from './services/customers-update.service';
import { CustomersGetAllService } from './services/customers-get-all.service';
import { CustomersBatchDeleteService } from './services/customers-batch-delete.service';
import { CustomersBatchUpdateService } from './services/customers-batch-update.service';
import { CustomersHelperService } from './services/customers-helper.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer, Invoice, Payment]),
    ],
    controllers: [CustomersController],
    providers: [
        CustomersCreateService,
        CustomersUpdateService,
        CustomersGetAllService,
        CustomersBatchDeleteService,
        CustomersBatchUpdateService,
        CustomersBatchUpdateService,
        CustomersHelperService,
    ],
})
export class CustomersModule { }
