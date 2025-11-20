import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Country } from '@prisma/client';

export class CreateRestaurantDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    image?: string;

    @ApiProperty({ enum: Country })
    @IsEnum(Country)
    country: Country;
}