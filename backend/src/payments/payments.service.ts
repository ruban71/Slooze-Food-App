import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async create(createPaymentDto: CreatePaymentDto, userId: string) {
        // If setting as default, unset other defaults
        if (createPaymentDto.isDefault) {
            await this.prisma.payment.updateMany({
                where: {
                    userId: userId
                },
                data: {
                    isDefault: false
                },
            });
        }

        return this.prisma.payment.create({
            data: {
                ...createPaymentDto,
                userId,
            },
        });
    }

    async findAll(userId: string, userRole: string) {
        const where = userRole === 'ADMIN' ? {} : { userId: userId };

        return this.prisma.payment.findMany({
            where,
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ],
        });
    }

    async findOne(id: string) {
        return this.prisma.payment.findUnique({
            where: { id },
        });
    }

    async update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string) {
        // If setting as default, unset other defaults
        if (updatePaymentDto.isDefault) {
            await this.prisma.payment.updateMany({
                where: {
                    userId: userId,
                    NOT: { id: id } // Exclude current payment
                },
                data: {
                    isDefault: false
                },
            });
        }

        return this.prisma.payment.update({
            where: { id },
            data: updatePaymentDto,
        });
    }

    async remove(id: string) {
        return this.prisma.payment.delete({
            where: { id },
        });
    }

    async setDefaultPayment(id: string, userId: string) {
        // Unset all other defaults
        await this.prisma.payment.updateMany({
            where: {
                userId: userId,
                NOT: { id: id } // Exclude current payment
            },
            data: {
                isDefault: false
            },
        });

        // Set new default
        return this.prisma.payment.update({
            where: { id },
            data: { isDefault: true },
        });
    }
}