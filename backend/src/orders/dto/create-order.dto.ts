import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @ApiProperty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty()
    menuItemId: string;
}

export class CreateOrderDto {
    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}