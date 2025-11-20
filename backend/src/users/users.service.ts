import { Injectable } from '@nestjs/common';
import { Role, Country } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                country: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async createUser(userData: {
        email: string;
        password: string;
        name: string;
        role: Role;  // Use the Role enum type
        country: Country;  // Use the Country enum type
    }) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        return this.prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                country: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                country: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
}