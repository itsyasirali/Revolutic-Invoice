import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    IsArray,
    IsDateString,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    itemId?: number;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    rate: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    amount: number;
}

export class CreateInvoiceDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    customerId: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    templateId?: number;

    @IsNotEmpty()
    @IsString()
    invoiceNumber: string;

    @IsNotEmpty()
    @IsDateString()
    invoiceDate: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items?: InvoiceItemDto[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    subTotal?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    total?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    received?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    remaining?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    previousRemaining?: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    discountPercent?: number;
}
