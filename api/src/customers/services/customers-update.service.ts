import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer.entity';
import { CustomersHelperService } from './customers-helper.service';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import * as path from 'path';

@Injectable()
export class CustomersUpdateService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        private helperService: CustomersHelperService,
    ) { }


    async update(userId: string, id: string, updateCustomerDto: UpdateCustomerDto, files: any[]) {
        try {
            const parsedId = parseInt(id);
            const existingCustomer = await this.customersRepository.findOne({ where: { id: parsedId } });
            if (!existingCustomer) {
                throw new NotFoundException('Customer not found');
            }

            const {
                customerType,
                companyName,
                displayName,
                currency,
                address,
                remarks,
                status,
            } = updateCustomerDto;

            if (!customerType) {
                throw new BadRequestException('Customer type is required');
            }
            if (!displayName || String(displayName).trim().length === 0) {
                throw new BadRequestException('Display Name is required');
            }

            const contacts = this.helperService.parseContactsFromBody(updateCustomerDto) || [];

            let existingFilesFromClient: string[] = [];
            const rawExisting = updateCustomerDto.existingDocuments ?? updateCustomerDto.existingFiles;

            if (Array.isArray(rawExisting)) {
                existingFilesFromClient = rawExisting;
            } else if (typeof rawExisting === 'string') {
                try {
                    existingFilesFromClient = JSON.parse(rawExisting);
                } catch (err) {
                    existingFilesFromClient = [];
                }
            }

            const newDocumentPaths = this.helperService.buildDocumentPaths(files);
            const finalDocuments = [...(existingFilesFromClient || []), ...newDocumentPaths];

            const prevDocs = existingCustomer.documents || [];
            const docsToDelete = prevDocs.filter((p) => !finalDocuments.includes(p));

            docsToDelete.forEach((p) => {
                try {
                    const absolute = path.resolve(p);
                    if (absolute.startsWith(path.resolve('uploads', 'customer'))) {
                        this.helperService.deleteFileIfExists(p);
                    }
                } catch (e) {
                    console.error('Failed to delete file:', p, e);
                }
            });

            existingCustomer.customerType = customerType ?? existingCustomer.customerType;
            existingCustomer.companyName = companyName ?? existingCustomer.companyName;
            existingCustomer.displayName = displayName ?? existingCustomer.displayName;
            existingCustomer.currency = currency ?? existingCustomer.currency;
            existingCustomer.address = address ?? existingCustomer.address;
            existingCustomer.remarks = remarks ?? existingCustomer.remarks;
            existingCustomer.status = status ?? existingCustomer.status ?? 'Active';
            existingCustomer.documents = finalDocuments;
            existingCustomer.contacts = contacts;

            await this.customersRepository.save(existingCustomer);


            return { message: 'Customer updated', customer: existingCustomer };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error updating customer:', error);
            throw new InternalServerErrorException('Failed to update customer');
        }
    }
}
