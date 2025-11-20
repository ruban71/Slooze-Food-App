import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Country } from '@prisma/client';

@Injectable()
export class RestaurantsService {
    constructor(private prisma: PrismaService) { }

    async create(createRestaurantDto: CreateRestaurantDto) {
        return this.prisma.restaurant.create({
            data: createRestaurantDto,
            include: {
                menuItems: true,
            },
        });
    }

    async findAll(userCountry: Country, userRole: string) {
        const where = userRole === 'ADMIN' ? {} : { country: userCountry };

        return this.prisma.restaurant.findMany({
            where,
            include: {
                menuItems: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.restaurant.findUnique({
            where: { id },
            include: {
                menuItems: true,
            },
        });
    }

    async update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
        return this.prisma.restaurant.update({
            where: { id },
            data: updateRestaurantDto,
            include: {
                menuItems: true,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.restaurant.delete({
            where: { id },
        });
    }
}