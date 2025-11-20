import { PrismaClient, Role, Country } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleared existing data');

    // Create users
    const users = [
        {
            email: 'nick@fury.com',
            password: await bcrypt.hash('admin123', 10),
            name: 'Nick Fury',
            role: Role.ADMIN,
            country: Country.INDIA,
        },
        {
            email: 'captain@marvel.com',
            password: await bcrypt.hash('manager123', 10),
            name: 'Captain Marvel',
            role: Role.MANAGER,
            country: Country.INDIA,
        },
        {
            email: 'captain@america.com',
            password: await bcrypt.hash('manager123', 10),
            name: 'Captain America',
            role: Role.MANAGER,
            country: Country.AMERICA,
        },
        {
            email: 'thanos@india.com',
            password: await bcrypt.hash('member123', 10),
            name: 'Thanos',
            role: Role.MEMBER,
            country: Country.INDIA,
        },
        {
            email: 'thor@india.com',
            password: await bcrypt.hash('member123', 10),
            name: 'Thor',
            role: Role.MEMBER,
            country: Country.INDIA,
        },
        {
            email: 'travis@america.com',
            password: await bcrypt.hash('member123', 10),
            name: 'Travis',
            role: Role.MEMBER,
            country: Country.AMERICA,
        },
    ];

    for (const userData of users) {
        await prisma.user.create({
            data: userData,
        });
        console.log(`✅ Created user: ${userData.email}`);
    }

    console.log('✅ All users created');

    // Create restaurants
    const restaurants = [
        {
            name: 'Spice Garden',
            description: 'Authentic Indian cuisine with modern twist',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop',
            country: Country.INDIA,
        },
        {
            name: 'Burger Hub',
            description: 'American style burgers and fries',
            image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=300&fit=crop',
            country: Country.AMERICA,
        },
        {
            name: 'Curry House',
            description: 'Traditional Indian curries and breads',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=300&fit=crop',
            country: Country.INDIA,
        },
        {
            name: 'Pizza Palace',
            description: 'Italian pizzas with American toppings',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop',
            country: Country.AMERICA,
        },
    ];

    for (const restaurantData of restaurants) {
        await prisma.restaurant.create({
            data: restaurantData,
        });
        console.log(`✅ Created restaurant: ${restaurantData.name}`);
    }

    console.log('✅ All restaurants created');

    console.log('🎉 Database seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });