import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class BatchDeleteCustomerDto {
    @IsNotEmpty()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return [];
            }
        }
        return value;
    })
    @IsArray()
    @IsString({ each: true })
    customers: string[];
}
