import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Customer } from '../customers/customer.entity';
import { Template } from '../templates/template.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicesCreateService } from './services/invoices-create.service';
import { InvoicesUpdateService } from './services/invoices-update.service';
import { InvoicesGetAllService } from './services/invoices-get-all.service';
import { InvoicesDeleteService } from './services/invoices-delete.service';
import { InvoicesSendService } from './services/invoices-send.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, InvoiceItem, Customer, Template]),
        ConfigModule,
    ],
    controllers: [InvoicesController],
    providers: [
        InvoicesCreateService,
        InvoicesUpdateService,
        InvoicesGetAllService,
        InvoicesDeleteService,
        InvoicesSendService,
    ],
    exports: [
        InvoicesCreateService,
        InvoicesUpdateService,
        InvoicesGetAllService,
        InvoicesDeleteService,
        InvoicesSendService,
    ],
})
export class InvoicesModule { }
