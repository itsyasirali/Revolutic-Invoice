import { IsNotEmpty, IsArray, IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';

export class SendPaymentDto {
    @IsNotEmpty()
    @IsArray()
    @IsEmail({}, { each: true })
    to: string[];

    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    cc?: string[];

    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    bcc?: string[];

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsBoolean()
    attachPDF?: boolean;
}
