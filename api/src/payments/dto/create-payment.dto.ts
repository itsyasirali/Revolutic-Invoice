import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, Min, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class AppliedInvoiceDto {
    @IsNotEmpty()
    invoiceId: number;

    @IsNumber()
    @Min(0.01)
    amount: number;
}

export class CreatePaymentDto {
    @IsString()
    @IsNotEmpty()
    paymentDate: string;

    @IsNumber()
    @IsOptional()
    paymentNumber?: number;

    @IsString()
    @IsOptional()
    referenceNo?: string;

    @IsNotEmpty()
    customerId: number;

    @IsString()
    @IsOptional()
    customerDisplayName?: string;

    @IsString()
    @IsOptional()
    customerEmail?: string;

    @IsString()
    @IsOptional()
    paymentMode?: string;

    @IsNumber()
    @Min(0)
    amountReceived: number;

    @IsNumber()
    @IsOptional()
    bankCharges?: number;

    @IsBoolean()
    @IsOptional()
    tdsApplied?: boolean;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsOptional()
    templateId?: number;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => AppliedInvoiceDto)
    appliedInvoices?: AppliedInvoiceDto[];
}
