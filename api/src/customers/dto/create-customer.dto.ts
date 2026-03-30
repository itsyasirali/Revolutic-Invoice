import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
    @IsNotEmpty({ message: 'Customer type is required' })
    @IsString()
    customerType: string;

    @IsOptional()
    @IsString()
    companyName?: string;

    @IsNotEmpty({ message: 'Display Name is required' })
    @IsString()
    displayName: string;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    remarks?: string;

    @IsOptional()
    @IsString()
    status?: string;

    // Contacts are parsed manually in service due to complex structure in FormData
    @IsOptional()
    contacts?: any;
}
