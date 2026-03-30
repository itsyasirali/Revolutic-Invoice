import { IsArray, IsNotEmpty, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class BatchUpdateCustomerDto {
    @IsNotEmpty()
    @IsString()
    @IsIn(['Active', 'inActive'], { message: 'Invalid status value' })
    status: string;

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
