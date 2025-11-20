import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    lastFour?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    upiId?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    paypalEmail?: string;

    @ApiProperty({ required: false, default: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}