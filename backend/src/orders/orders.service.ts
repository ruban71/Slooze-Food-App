import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Country, OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async create(createOrderDto: CreateOrderDto, userId: string) {
        const { items, ...orderData } = createOrderDto;

        // Calculate total amount
        const menuItems = await this.prisma.menuItem.findMany({
            where: {
                id: { in: items.map(item => item.menuItemId) },
            },
        });

        const totalAmount = items.reduce((total, item) => {
            const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
            return total + (menuItem?.price || 0) * item.quantity;
        }, 0);

        return this.prisma.order.create({
            data: {
                ...orderData,
                totalAmount,
                userId,
                items: {
                    create: items.map(item => ({
                        quantity: item.quantity,
                        menuItemId: item.menuItemId,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async findAll(userId: string, userCountry: Country, userRole: string) {
        const where: any = {};

        if (userRole !== 'ADMIN') {
            where.user = {
                country: userCountry,
            };

            // For non-admin users, only show their own orders
            if (userRole === 'MEMBER') {
                where.userId = userId;
            }
        }

        return this.prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        country: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async cancelOrder(id: string) {
        return this.prisma.order.update({
            where: { id },
            data: { status: OrderStatus.CANCELLED },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });
    }

    async updateStatus(id: string, status: OrderStatus) {
        return this.prisma.order.update({
            where: { id },
            data: { status },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });
    }
}