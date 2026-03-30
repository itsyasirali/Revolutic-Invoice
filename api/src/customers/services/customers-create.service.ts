import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customer.entity';
import { CustomersHelperService } from './customers-helper.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';

@Injectable()
export class CustomersCreateService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        private helperService: CustomersHelperService,
    ) { }


    async create(userId: string, createCustomerDto: CreateCustomerDto, files: any[]) {
        try {
            const {
                customerType,
                companyName,
                displayName,
                currency = 'USD',
                address,
                remarks,
                status,
            } = createCustomerDto;

            if (!customerType) {
                throw new BadRequestException('Customer type is required');
            }
            if (!displayName || String(displayName).trim().length === 0) {
                throw new BadRequestException('Display Name is required');
            }

            const contacts = this.helperService.parseContactsFromBody(createCustomerDto) || [];
            const documentPaths = this.helperService.buildDocumentPaths(files);

            const customer = this.customersRepository.create({
                userId: parseInt(userId),
                customerType,
                companyName,
                displayName,
                currency,
                address,
                remarks,
                documents: documentPaths,
                contacts,
                status: status || 'Active',
            });

            await this.customersRepository.save(customer);
            return { message: 'Customer created successfully', customer };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            console.error('Error creating customer:', error);
            throw new InternalServerErrorException('Failed to create customer');
        }
    }
}
