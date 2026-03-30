import { PartialType } from '@nestjs/mapped-types'; // or @nestjs/swagger if available, but mapped-types is safer standard
import { CreateCustomerDto } from './create-customer.dto';
import { IsOptional } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
    @IsOptional()
    existingDocuments?: string | string[];

    @IsOptional()
    existingFiles?: string | string[];
}
